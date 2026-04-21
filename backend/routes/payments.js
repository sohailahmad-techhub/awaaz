const express = require('express');
const router = express.Router();
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } else {
    console.warn('[Payments] STRIPE_SECRET_KEY is missing. Payment routes will be limited.');
  }
} catch (err) {
  console.error('[Payments] Stripe initialization failed:', err.message);
}

const { protect } = require('../middleware/authMiddleware');
const Project = require('../models/Project');
const Problem = require('../models/Problem');
const Transaction = require('../models/Transaction');
const { chainTransaction } = require('../utils/blockchain');

// Test Route
router.get('/ping', (req, res) => res.json({ message: 'Payments router alive' }));

// 0. Transparency Ledger (Public)
router.get('/ledger', async (req, res) => {
  console.log('[API] GET /payments/ledger hit');
  try {
    const { projectId } = req.query;
    const filter = { status: 'completed' };
    if (projectId) filter.projectId = projectId;

    const ledger = await Transaction.find(filter)
      .populate('ngoId', 'name')
      .populate({
        path: 'projectId',
        populate: { path: 'problem', select: 'title' }
      })
      .sort({ createdAt: -1 });

    console.log(`[API] Returning ${ledger.length} ledger entries`);
    res.json(ledger);
  } catch (error) {
    console.error('[API] Ledger Error:', error);
    res.status(500).json({ message: 'Could not fetch ledger', error: error.message });
  }
});

// 1. Create Stripe Checkout Session
router.post('/create-checkout', protect, async (req, res) => {
  try {
    const { projectId, amount } = req.body;
    
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can fund projects via Stripe' });
    }

    const project = await Project.findById(projectId).populate('problem');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const pendingTx = new Transaction({
      projectId,
      ngoId: req.user.id,
      amount: Number(amount),
      status: 'pending'
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Funding: ${project.problem.title}`,
            description: `AWAAZ Community Project Funding for ${project.problem.location}`,
          },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/cancel`,
      metadata: {
        projectId: projectId.toString(),
        ngoId: req.user.id.toString(),
        txId: pendingTx._id.toString()
      }
    });

    pendingTx.stripeSessionId = session.id;
    await pendingTx.save();

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ message: 'Could not initiate payment', error: error.message });
  }
});

// 2. Verify Session
router.post('/verify-session', protect, async (req, res) => {
  try {
    const { session_id } = req.body;
    let transaction = await Transaction.findOne({ stripeSessionId: session_id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    
    if (transaction.status === 'completed') {
      return res.json({ message: 'Already verified', transaction });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      transaction.stripePaymentIntentId = session.payment_intent;
      await chainTransaction(transaction);
      
      const project = await Project.findById(transaction.projectId);
      if (project) {
        project.fundingRaised += transaction.amount;
        project.funders.push({
          ngo: transaction.ngoId,
          amount: transaction.amount,
          transactionHash: transaction.blockHash,
          stripePaymentIntentId: session.payment_intent
        });
        
        if (project.fundingRaised >= project.fundingGoal) {
          project.status = 'In Progress';
          const problem = await Problem.findById(project.problem);
          if (problem) {
            problem.status = 'Funded';
            await problem.save();
          }
        }
        await project.save();
      }

      res.json({ message: 'Payment verified and ledger updated', transaction });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

module.exports = router;
