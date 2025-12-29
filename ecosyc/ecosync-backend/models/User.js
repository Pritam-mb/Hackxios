import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String
  },
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  ecoPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['seedling', 'sapling', 'oak', 'champion'],
    default: 'seedling'
  },
  profilePhoto: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index
userSchema.index({ location: '2dsphere' });

export default mongoose.model('User', userSchema);
