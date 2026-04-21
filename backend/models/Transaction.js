const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  stripeSessionId: { type: String, required: true, unique: true },
  stripePaymentIntentId: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  
  // Blockchain-like Hash Chain
  blockHash: { type: String },    // Hash of this transaction + prevHash
  prevHash: { type: String },     // Reference to the previous transaction's hash
  
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for ledger performance
transactionSchema.index({ prevHash: 1 });
transactionSchema.index({ blockHash: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
