import express from 'express';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('item', 'title imageUrl')
      .populate('borrower', 'name profilePhoto')
      .populate('lender', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user transactions
router.get('/user/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ borrower: req.params.userId }, { lender: req.params.userId }]
    })
      .populate('item', 'title imageUrl')
      .populate('borrower', 'name profilePhoto')
      .populate('lender', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update transaction
router.patch('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
