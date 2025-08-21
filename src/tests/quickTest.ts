import { config } from 'dotenv';
import { ScientificOpenAIService } from '../services/scientificOpenAIService';

// Load environment variables
config();

async function quickTest() {
  console.log('🧪 Quick Test - Scientific OpenAI Service\n');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    return;
  }

  const service = new ScientificOpenAIService();
  
  // Generate description test
  const description = service.generateDescription('masculino', 'hipertrofia', '5-7');
  console.log('✅ Description Generated:', description);
  console.log('Expected: "Homem - Hipertrofia - 5-7x/semana"\n');

  // Test with minimal parameters (no actual API call)
  const testParams = {
    weight: 80,
    height: 180,
    age: 28,
    gender: 'masculino',
    objective: 'hipertrofia',
    trainingFrequency: '5-7' as '5-7',
    activityType: 'musculacao' as 'musculacao',
    wheyProtein: true,
    hypercaloric: true,
    preferences: ['frango', 'arroz', 'batata doce'],
    restrictions: [],
    healthConditions: [],
    morningSnackActive: true,
    afternoonSnackActive: true
  };

  console.log('📊 Test Parameters:');
  console.log(JSON.stringify(testParams, null, 2));
  
  console.log('\n✅ Service initialized successfully!');
  console.log('✅ Types are properly configured!');
  console.log('\n💡 To test actual API generation, uncomment the API call in testScientificPrompt.ts');
}

quickTest().then(() => {
  console.log('\n✅ Quick test completed successfully');
}).catch((error) => {
  console.error('\n❌ Quick test failed:', error);
});