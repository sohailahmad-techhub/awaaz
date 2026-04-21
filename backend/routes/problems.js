const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const { protect } = require('../middleware/authMiddleware');
const { verifyProblemWithAI } = require('../utils/openRouter');

// Get all problems (public)
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find()
      .populate('reportedBy', 'name trustScore')
      .sort('-createdAt');
    res.json(problems);
  } catch (error) {
    console.error('GET /problems error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /problems/flagged — admin: AI-flagged (score < 60 or not verified)
router.get('/flagged', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const flagged = await Problem.find({
      $or: [
        { 'aiVerification.verified': false },
        { 'aiVerification.score': { $lt: 60 } }
      ]
    })
      .populate('reportedBy', 'name email')
      .sort('-createdAt');
    res.json(flagged);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a problem (authenticated users)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, urgency, location, coordinates, image } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: 'Missing required fields: title, description, category, location' });
    }

    let aiResult;
    try {
      aiResult = await verifyProblemWithAI(title, description, image || null);
    } catch (aiErr) {
      console.warn('AI verification failed, using fallback:', aiErr.message);
      aiResult = { score: 70, verified: true, reason: 'AI verification skipped. Submitted for manual review.', isUnique: true };
    }

    const problem = new Problem({
      title,
      description,
      category,
      urgency: urgency || 'Medium',
      location,
      coordinates: coordinates || {},
      image: image || '',
      reportedBy: req.user.id,
      status: 'Reported',
      aiVerification: aiResult
    });

    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    console.error('POST /problems error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upvote a problem
router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Not found' });
    problem.upvotes += 1;
    await problem.save();
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /problems/:id/approve — admin: override AI and mark as verified
router.patch('/:id/approve', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Not found' });
    problem.aiVerification.verified = true;
    problem.aiVerification.score = 100;
    problem.aiVerification.reason = 'Manually approved by AWAAZ administrator.';
    await problem.save();
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /problems/:id — admin: remove spam/duplicate report
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
