import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

export const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
    return null;
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini AI initialized');
  return genAI;
};

// Generate personalized recommendations
export const generateRecommendations = async (userProfile, userItems, userTransactions) => {
  try {
    if (!genAI) initializeGemini();
    if (!genAI) return null;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an AI assistant for EcoSync, a peer-to-peer sharing platform. Analyze this user's profile and suggest 5 items they might want to borrow or lend.

User Profile:
- Name: ${userProfile.name}
- Eco Points: ${userProfile.ecoPoints}
- Level: ${userProfile.level}
- Items Shared: ${userItems.length}
- Transactions: ${userTransactions.length}

Items they currently share: ${userItems.map(i => i.title).join(', ') || 'None'}

Recent activity: ${userTransactions.slice(0, 3).map(t => t.item?.title).join(', ') || 'None'}

Provide 5 specific item recommendations with brief reasons. Format as JSON array:
[{"item": "item name", "reason": "why they might need it", "type": "borrow or lend"}]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return null;
  }
};

// Generate eco-impact insights
export const generateEcoInsights = async (userProfile, co2Saved, moneySaved, itemsShared) => {
  try {
    if (!genAI) initializeGemini();
    if (!genAI) return null;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an eco-impact analyst for EcoSync. Analyze this user's environmental impact and provide 3 actionable tips to improve.

User Stats:
- CO2 Saved: ${co2Saved} kg
- Money Saved: ₹${moneySaved}
- Items Shared: ${itemsShared}
- Eco Points: ${userProfile.ecoPoints}
- Level: ${userProfile.level}

Provide 3 specific, actionable tips to increase their eco-impact. Be encouraging and specific. Format as JSON array:
[{"tip": "specific action", "potential_impact": "estimated CO2 or money savings"}]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error generating eco insights:', error);
    return null;
  }
};

// Generate achievement summary
export const generateAchievementSummary = async (userProfile, achievements) => {
  try {
    if (!genAI) initializeGemini();
    if (!genAI) return null;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Create a personalized, encouraging achievement summary for this EcoSync user.

User: ${userProfile.name}
Level: ${userProfile.level}
Eco Points: ${userProfile.ecoPoints}
Achievements: ${achievements.join(', ')}

Write a 2-3 sentence motivational summary highlighting their impact and encouraging continued participation. Be warm and personal.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating achievement summary:', error);
    return null;
  }
};

// Analyze item image and suggest category/details
export const analyzeItemImage = async (imageBase64) => {
  try {
    if (!genAI) initializeGemini();
    if (!genAI) return null;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Analyze this image and identify the item. Provide:
1. Item name
2. Category (tools, kitchen, electronics, outdoor, sports, other)
3. Brief description
4. Suggested rental price per day in INR
5. Condition assessment

Format as JSON:
{"name": "", "category": "", "description": "", "price": 0, "condition": ""}
`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return null;
  }
};

// Generate smart badges based on user behavior
export const generateSmartBadges = async (userProfile, userActivity) => {
  try {
    if (!genAI) initializeGemini();
    if (!genAI) return null;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Based on this user's activity, suggest 3 unique, creative badges they've earned.

User Activity:
- Items Shared: ${userActivity.itemsShared}
- Transactions: ${userActivity.transactions}
- Days Active: ${userActivity.daysActive}
- Response Rate: ${userActivity.responseRate}%
- Categories Used: ${userActivity.categories.join(', ')}

Create 3 unique badge names with emoji and description. Be creative and specific to their behavior. Format as JSON:
[{"emoji": "🎯", "name": "Badge Name", "description": "Why they earned it"}]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error generating smart badges:', error);
    return null;
  }
};

// Chatbot response
export const getChatbotResponse = async (userMessage, context = {}) => {
  try {
    if (!genAI) initializeGemini();
    if (!genAI) return "I'm currently unavailable. Please try again later.";

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are EcoBot, a helpful assistant for EcoSync - a peer-to-peer sharing platform for tools and items.

User Context:
- Logged in: ${context.isLoggedIn || false}
- User name: ${context.userName || 'Guest'}
- Items shared: ${context.itemsShared || 0}

User message: "${userMessage}"

Provide a helpful, friendly response. Keep it concise (2-3 sentences). If they ask about features, explain how EcoSync works. If they need help, guide them step by step.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    return "I'm having trouble responding right now. Please try again.";
  }
};

// Auto-complete profile
export const generateProfileSuggestions = async (partialProfile) => {
  try {
    if (!genAI) initializeGemini();
    if (!genAI) return null;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Based on this partial user profile, suggest a bio, skills, and interests for an EcoSync user.

Partial Profile:
- Name: ${partialProfile.name || 'User'}
- Location: ${partialProfile.location || 'Not specified'}
- Items they might share: ${partialProfile.items || 'Not specified'}

Generate:
1. A friendly 2-sentence bio
2. 3-5 relevant skills
3. 3-5 interests related to sharing economy

Format as JSON:
{"bio": "", "skills": [], "interests": []}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error generating profile suggestions:', error);
    return null;
  }
};

export default {
  initializeGemini,
  generateRecommendations,
  generateEcoInsights,
  generateAchievementSummary,
  analyzeItemImage,
  generateSmartBadges,
  getChatbotResponse,
  generateProfileSuggestions
};
