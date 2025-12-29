import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  description: String,
  urgency: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'fulfilled', 'expired'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24*60*60*1000) // 24 hours from now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index
requestSchema.index({ location: '2dsphere' });

export default mongoose.model('Request', requestSchema);
