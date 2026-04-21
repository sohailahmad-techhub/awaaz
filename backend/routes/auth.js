const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Problem = require('../models/Problem');
const { protect } = require('../middleware/authMiddleware');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashedPassword, role: role || 'citizen' });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me — current user profile with real stats
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch this user's reported problems
    const myProblems = await Problem.find({ reportedBy: req.user.id })
      .sort('-createdAt')
      .select('title status urgency createdAt aiVerification category location');

    const verifiedCount = myProblems.filter(p => p.aiVerification?.verified).length;
    const resolvedCount = myProblems.filter(p => p.status === 'Resolved').length;
    const accuracy = myProblems.length > 0
      ? Math.round((verifiedCount / myProblems.length) * 100)
      : 100;

    // Simple trust score: base 50 + 10 per verified report + 20 per resolved
    const trustScore = Math.min(999, 50 + verifiedCount * 10 + resolvedCount * 20);

    res.json({
      user,
      stats: {
        totalReports: myProblems.length,
        verifiedCount,
        resolvedCount,
        accuracy,
        trustScore
      },
      problems: myProblems
    });
  } catch (error) {
    console.error('GET /me error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/users — admin: list all users
router.get('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/auth/profile — update current user details
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }

    if (name) user.name = name;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
