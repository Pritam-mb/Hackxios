import {
  generateRecommendations,
  generateEcoInsights,
  generateAchievementSummary,
  analyzeItemImage,
  generateSmartBadges,
  getChatbotResponse,
  generateProfileSuggestions
} from '../services/geminiService.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Transaction from '../models/Transaction.js';

// @desc    Get personalized recommendations
// @route   GET /api/ai/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
  try {
    console.log('🤖 AI Recommendations requested by user:', req.user?.id);
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    const items = await Item.find({ owner: userId });
    const transactions = await Transaction.find({
      $or: [{ borrower: userId }, { lender: userId }]
    }).populate('item');

    console.log(`📊 User data: ${items.length} items, ${transactions.length} transactions`);

    const recommendations = await generateRecommendations(user, items, transactions);

    console.log('✅ Recommendations generated:', recommendations ? recommendations.length : 0);

    res.json({
      success: true,
      recommendations: recommendations || []
    });
  } catch (error) {
    console.error('❌ Get recommendations error:', error);
    res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
  }
};

// @desc    Get eco-impact insights
// @route   GET /api/ai/insights
// @access  Private
export const getEcoInsights = async (req, res) => {
  try {
    console.log('🌱 AI Insights requested by user:', req.user?.id);
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    const items = await Item.find({ owner: userId });
    const transactions = await Transaction.find({
      $or: [{ borrower: userId }, { lender: userId }]
    });

    const co2Saved = items.length * 5 + transactions.length * 3;
    const moneySaved = transactions.reduce((sum, t) => sum + (t.ecoImpactMoney || 50), 0);

    console.log(`📊 Impact: ${co2Saved}kg CO2, ₹${moneySaved} saved`);

    const insights = await generateEcoInsights(user, co2Saved, moneySaved, items.length);

    console.log('✅ Insights generated:', insights ? insights.length : 0);

    res.json({
      success: true,
      insights: insights || []
    });
  } catch (error) {
    console.error('❌ Get eco insights error:', error);
    res.status(500).json({ message: 'Failed to generate insights', error: error.message });
  }
};

// @desc    Get achievement summary
// @route   GET /api/ai/achievement-summary
// @access  Private
export const getAchievementSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    const items = await Item.find({ owner: userId });
    const transactions = await Transaction.find({
      $or: [{ borrower: userId }, { lender: userId }]
    });

    const achievements = [];
    if (items.length > 0) achievements.push('Item Sharer');
    if (transactions.length >= 5) achievements.push('Active Trader');
    if (user.ecoPoints >= 100) achievements.push('Eco Warrior');
    if (user.level === 'champion') achievements.push('Platform Champion');

    const summary = await generateAchievementSummary(user, achievements);

    res.json({
      success: true,
      summary: summary || 'Keep up the great work on EcoSync!'
    });
  } catch (error) {
    console.error('Get achievement summary error:', error);
    res.status(500).json({ message: 'Failed to generate summary', error: error.message });
  }
};

// @desc    Analyze item image
// @route   POST /api/ai/analyze-image
// @access  Private
export const analyzeImage = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    const analysis = await analyzeItemImage(imageBase64);

    res.json({
      success: true,
      analysis: analysis || { message: 'Could not analyze image' }
    });
  } catch (error) {
    console.error('Analyze image error:', error);
    res.status(500).json({ message: 'Failed to analyze image', error: error.message });
  }
};

// @desc    Get smart badges
// @route   GET /api/ai/smart-badges
// @access  Private
export const getSmartBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    const items = await Item.find({ owner: userId });
    const transactions = await Transaction.find({
      $or: [{ borrower: userId }, { lender: userId }]
    });

    const categories = [...new Set(items.map(i => i.category))];
    const daysActive = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

    const userActivity = {
      itemsShared: items.length,
      transactions: transactions.length,
      daysActive,
      responseRate: 95, // Mock data
      categories
    };

    const badges = await generateSmartBadges(user, userActivity);

    res.json({
      success: true,
      badges: badges || []
    });
  } catch (error) {
    console.error('Get smart badges error:', error);
    res.status(500).json({ message: 'Failed to generate badges', error: error.message });
  }
};

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Public
export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let context = { isLoggedIn: false };
    
    if (userId) {
      const user = await User.findById(userId);
      const items = await Item.find({ owner: userId });
      context = {
        isLoggedIn: true,
        userName: user.name,
        itemsShared: items.length
      };
    }

    const response = await getChatbotResponse(message, context);

    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to get response', error: error.message });
  }
};

// @desc    Get profile suggestions
// @route   POST /api/ai/profile-suggestions
// @access  Private
export const getProfileSuggestions = async (req, res) => {
  try {
    const { name, location, items } = req.body;

    const suggestions = await generateProfileSuggestions({ name, location, items });

    res.json({
      success: true,
      suggestions: suggestions || { bio: '', skills: [], interests: [] }
    });
  } catch (error) {
    console.error('Get profile suggestions error:', error);
    res.status(500).json({ message: 'Failed to generate suggestions', error: error.message });
  }
};
