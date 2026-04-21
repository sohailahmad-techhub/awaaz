const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
  leadNgo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The NGO that initiated the project
  fundingGoal: { type: Number, required: true },
  fundingRaised: { type: Number, default: 0 },
  funders: [{
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    transactionHash: String, // Referencing Transaction.blockHash
    stripePaymentIntentId: String,
    date: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['Funding', 'In Progress', 'Completed'],
    default: 'Funding'
  },
  milestones: [{
    title: String,
    completed: { type: Boolean, default: false },
    proofImage: String,
    updatedAt: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
