import express from 'express';
import Request from '../models/Request.js';

const router = express.Router();

// Get all active requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find({ status: 'active' })
      .populate('user', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get requests near a location
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query; // maxDistance in meters
    
    const requests = await Request.find({
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).populate('user', 'name profilePhoto');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new request
router.post('/', async (req, res) => {
  try {
    const { itemName, description, urgency, coordinates, userId } = req.body;
    
    const request = new Request({
      user: userId || '000000000000000000000000', // Temporary - replace with auth
      itemName,
      description,
      urgency,
      location: {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]] // [lng, lat]
      }
    });
    
    const savedRequest = await request.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update request status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a request
router.delete('/:id', async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
