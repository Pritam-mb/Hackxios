import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const testGemini = async () => {
  console.log('🧪 Testing Gemini API...\n');
  
  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    return;
  }
  
  console.log('✅ API Key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
  
  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('✅ Gemini initialized with model: gemini-2.5-flash\n');
    
    // Test simple prompt
    console.log('📤 Sending test prompt...');
    const prompt = 'Say "Hello from EcoSync!" and confirm you are working.';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Response received:\n');
    console.log('📝', text);
    console.log('\n✨ Gemini is working perfectly!');
    
  } catch (error) {
    console.error('❌ Error testing Gemini:', error.message);
    if (error.message.includes('API key')) {
      console.error('💡 Check if your API key is valid');
    } else if (error.message.includes('model')) {
      console.error('💡 The model name might be incorrect');
    }
  }
};

testGemini();
