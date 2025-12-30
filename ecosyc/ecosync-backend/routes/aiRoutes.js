import express from 'express';
import {
  getRecommendations,
  getEcoInsights,
  getAchievementSummary,
  analyzeImage,
  getSmartBadges,
  chat,
  getProfileSuggestions
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/recommendations', protect, getRecommendations);
router.get('/insights', protect, getEcoInsights);
router.get('/achievement-summary', protect, getAchievementSummary);
router.post('/analyze-image', protect, analyzeImage);
router.get('/smart-badges', protect, getSmartBadges);
router.post('/chat', chat); // Public endpoint
router.post('/profile-suggestions', protect, getProfileSuggestions);

export default router;
