import express from 'express';
import Item from '../models/Item.js';

const router = express.Router();

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find({ status: 'available' })
      .populate('owner', 'name profilePhoto trustScore')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get items near a location
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000, category } = req.query;
    
    const query = {
      status: 'available',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };
    
    if (category) query.category = category;
    
    const items = await Item.find(query).populate('owner', 'name profilePhoto trustScore');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name profilePhoto trustScore ecoPoints level');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new item
router.post('/', async (req, res) => {
  try {
    const { title, description, category, type, price, coordinates, imageUrl, ownerId } = req.body;
    
    const item = new Item({
      owner: ownerId || '000000000000000000000000', // Temporary - replace with auth
      title,
      description,
      category,
      type,
      price,
      imageUrl,
      location: {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]] // [lng, lat]
      }
    });
    
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update item
router.patch('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
