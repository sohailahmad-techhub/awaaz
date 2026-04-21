const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Road Infrastructure', 'Water Supply', 'Electricity', 'Waste Management', 'Other'],
    required: true
  },
  urgency: { 
    type: String, 
    enum: ['Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  location: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  image: { type: String, default: '' }, // URL or base64 — optional to avoid 500 on missing image
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    // Added 'Reported' as the initial status before NGO adoption
    enum: ['Reported', 'Seeking Funds', 'Funded', 'In Progress', 'Resolved'],
    default: 'Reported'
  },
  aiVerification: {
    verified: { type: Boolean, default: false },
    score:    { type: Number,  default: 0 },
    reason:   { type: String,  default: '' },
    isUnique: { type: Boolean, default: true }
  },
  upvotes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
