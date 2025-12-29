import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['tools', 'kitchen', 'electronics', 'outdoor', 'sports', 'other'],
    required: true
  },
  type: {
    type: String,
    enum: ['lend', 'rent', 'sell', 'auction'],
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'unavailable'],
    default: 'available'
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
  imageUrl: String,
  conditionPhotoUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index
itemSchema.index({ location: '2dsphere' });

export default mongoose.model('Item', itemSchema);
