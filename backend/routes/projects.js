const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Problem = require('../models/Problem');
const { protect } = require('../middleware/authMiddleware');
const { executeSmartContractFunding } = require('../utils/blockchain');

// ─── GET ROUTES (specific routes MUST come before wildcard /:id) ─────────────

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('problem')
      .populate('leadNgo', 'name email')
      .populate('funders.ngo', 'name')
      .sort('-createdAt');
    res.json(projects);
  } catch (error) {
    console.error('GET /projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get project by problem ID — MUST be before /:id to avoid Express matching "problem" as an id
router.get('/problem/:problemId', async (req, res) => {
  try {
    const project = await Project.findOne({ problem: req.params.problemId })
      .populate('problem')
      .populate('leadNgo', 'name email')
      .populate('funders.ngo', 'name');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error('GET /projects/problem/:problemId error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single project by ID — wildcard, must be AFTER specific routes
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('problem')
      .populate('leadNgo', 'name email')
      .populate('funders.ngo', 'name');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error('GET /projects/:id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── POST ROUTES ──────────────────────────────────────────────────────────────

// Create project from problem (NGO adopts a verified issue)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can create projects' });
    }

    const { problemId, fundingGoal, milestones } = req.body;

    if (!problemId || !fundingGoal) {
      return res.status(400).json({ message: 'problemId and fundingGoal are required' });
    }

    // Check if project already exists for this problem
    const existing = await Project.findOne({ problem: problemId });
    if (existing) {
      return res.status(400).json({ message: 'A project already exists for this problem' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const project = new Project({
      problem: problemId,
      leadNgo: req.user.id,
      fundingGoal: Number(fundingGoal),
      milestones: milestones || [
        { title: 'Initial Assessment & Site Visit', completed: false },
        { title: 'Procurement & Mobilization', completed: false },
        { title: 'Execution Phase', completed: false },
        { title: 'Final Inspection & Handover', completed: false }
      ]
    });

    await project.save();

    // Update problem status
    problem.status = 'Seeking Funds';
    await problem.save();

    // Return populated project
    const populated = await Project.findById(project._id)
      .populate('problem')
      .populate('leadNgo', 'name email')
      .populate('funders.ngo', 'name');

    res.status(201).json(populated);
  } catch (error) {
    console.error('POST /projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fund project (NGO only)
router.post('/:id/fund', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can fund projects' });
    }

    const { amount } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid positive amount is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Execute simulated blockchain transaction
    const txResult = await executeSmartContractFunding(req.user.id, project._id, Number(amount));

    project.fundingRaised += Number(amount);
    project.funders.push({
      ngo: req.user.id,
      amount: Number(amount),
      transactionHash: txResult.transactionHash
    });

    // Auto-advance status when fully funded
    if (project.fundingRaised >= project.fundingGoal) {
      project.status = 'In Progress';
      const problem = await Problem.findById(project.problem);
      if (problem) {
        problem.status = 'Funded';
        await problem.save();
      }
    }

    await project.save();

    // Return fully populated project
    const updated = await Project.findById(project._id)
      .populate('problem')
      .populate('leadNgo', 'name email')
      .populate('funders.ngo', 'name');

    res.json(updated);
  } catch (error) {
    console.error('POST /projects/:id/fund error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add / complete a milestone
router.post('/:id/milestone', protect, async (req, res) => {
  try {
    const { title, proofImage, milestoneIndex } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (milestoneIndex !== undefined && project.milestones[milestoneIndex]) {
      // Mark existing milestone as completed
      project.milestones[milestoneIndex].completed = true;
      project.milestones[milestoneIndex].proofImage = proofImage || '';
      project.milestones[milestoneIndex].updatedAt = new Date();
    } else {
      // Push a new milestone (already completed)
      project.milestones.push({
        title: title || 'Update',
        completed: true,
        proofImage: proofImage || '',
        updatedAt: new Date()
      });
    }

    // Auto-complete project when all milestones are done
    const allDone = project.milestones.every(m => m.completed);
    if (allDone && project.milestones.length > 0) {
      project.status = 'Completed';
      const problem = await Problem.findById(project.problem);
      if (problem) {
        problem.status = 'Resolved';
        await problem.save();
      }
    }

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('problem')
      .populate('leadNgo', 'name email')
      .populate('funders.ngo', 'name');

    res.json(updated);
  } catch (error) {
    console.error('POST /projects/:id/milestone error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
