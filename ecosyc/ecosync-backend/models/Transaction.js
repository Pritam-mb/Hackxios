import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupTime: Date,
  returnTime: Date,
  status: {
    type: String,
    enum: ['requested', 'active', 'completed', 'disputed'],
    default: 'requested'
  },
  qrCodeHash: String,
  ratingLender: {
    type: Number,
    min: 1,
    max: 5
  },
  ratingBorrower: {
    type: Number,
    min: 1,
    max: 5
  },
  reviewLender: String,
  reviewBorrower: String,
  ecoImpactCO2: Number,
  ecoImpactMoney: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Transaction', transactionSchema);
