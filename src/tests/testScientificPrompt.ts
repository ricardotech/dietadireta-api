import { config } from 'dotenv';
import { ScientificOpenAIService } from '../services/scientificOpenAIService';
import { DietGenerationParams } from '../types/diet.types';

// Load environment variables
config();

async function testScientificPrompt() {
  const service = new ScientificOpenAIService();
  
  console.log('🧪 Starting Scientific Diet Prompt Tests\n');
  console.log('=' .repeat(80));

  const testCases: Array<{
    name: string;
    params: DietGenerationParams;
    expectedRanges: {
      proteinPerKg: { min: number; max: number };
      carbsPercentage: { min: number; max: number };
      calorieAdjustment: { min: number; max: number };
    };
  }> = [
    {
      name: 'Homem - Hipertrofia - Alta Frequência',
      params: {
        weight: 82,
        height: 180,
        age: 28,
        gender: 'masculino',
        objective: 'hipertrofia',
        trainingFrequency: '5-7',
        activityType: 'musculacao',
        wheyProtein: true,
        hypercaloric: true,
        preferences: ['frango', 'arroz integral', 'batata doce', 'ovos', 'aveia'],
        restrictions: [],
        healthConditions: [],
        morningSnackActive: true,
        afternoonSnackActive: true
      },
      expectedRanges: {
        proteinPerKg: { min: 1.6, max: 2.2 },
        carbsPercentage: { min: 50, max: 60 },
        calorieAdjustment: { min: 400, max: 650 }
      }
    },
    {
      name: 'Mulher - Emagrecimento - Média Frequência',
      params: {
        weight: 65,
        height: 165,
        age: 32,
        gender: 'feminino',
        objective: 'emagrecimento',
        trainingFrequency: '3-5',
        activityType: 'misto',
        wheyProtein: true,
        hypercaloric: false,
        preferences: ['peixe', 'quinoa', 'vegetais', 'frutas'],
        restrictions: ['lactose'],
        healthConditions: [],
        morningSnackActive: false,
        afternoonSnackActive: true
      },
      expectedRanges: {
        proteinPerKg: { min: 2.0, max: 2.5 },
        carbsPercentage: { min: 30, max: 50 },
        calorieAdjustment: { min: -500, max: -300 }
      }
    },
    {
      name: 'Homem - Cutting/Definição - Alta Frequência',
      params: {
        weight: 78,
        height: 175,
        age: 25,
        gender: 'masculino',
        objective: 'cutting',
        trainingFrequency: '5-7',
        activityType: 'musculacao',
        wheyProtein: true,
        hypercaloric: false,
        preferences: ['frango', 'claras de ovo', 'vegetais', 'aveia'],
        restrictions: [],
        healthConditions: [],
        morningSnackActive: true,
        afternoonSnackActive: true
      },
      expectedRanges: {
        proteinPerKg: { min: 2.5, max: 3.5 },
        carbsPercentage: { min: 20, max: 45 },
        calorieAdjustment: { min: -650, max: -450 }
      }
    },
    {
      name: 'Recomposição Corporal - Frequência Moderada',
      params: {
        weight: 75,
        height: 170,
        age: 30,
        gender: 'masculino',
        objective: 'recomposicao_corporal',
        trainingFrequency: '3-5',
        activityType: 'funcional',
        wheyProtein: false,
        hypercaloric: false,
        preferences: ['carne vermelha', 'feijão', 'mandioca', 'arroz'],
        restrictions: ['gluten'],
        healthConditions: [],
        morningSnackActive: true,
        afternoonSnackActive: false
      },
      expectedRanges: {
        proteinPerKg: { min: 2.0, max: 2.8 },
        carbsPercentage: { min: 30, max: 50 },
        calorieAdjustment: { min: -200, max: 200 }
      }
    }
  ];

  const results: any[] = [];

  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
    console.log('-'.repeat(60));
    
    try {
      console.log('⏳ Generating diet...');
      const startTime = Date.now();
      
      const diet = await service.generateScientificDiet(testCase.params);
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      // Generate description
      const description = service.generateDescription(
        testCase.params.gender || 'masculino',
        testCase.params.objective,
        testCase.params.trainingFrequency
      );
      
      // Validate results
      const validations = {
        proteinPerKg: diet.scientificValidation.proteinPerKg,
        proteinInRange: diet.scientificValidation.proteinPerKg >= testCase.expectedRanges.proteinPerKg.min &&
                        diet.scientificValidation.proteinPerKg <= testCase.expectedRanges.proteinPerKg.max,
        carbsPercentage: diet.macroDistribution.carbs.percentage,
        carbsInRange: diet.macroDistribution.carbs.percentage >= testCase.expectedRanges.carbsPercentage.min &&
                      diet.macroDistribution.carbs.percentage <= testCase.expectedRanges.carbsPercentage.max,
        proteinPerMealOk: diet.scientificValidation.proteinPerMealOk,
        macroDistributionOk: diet.scientificValidation.macroDistributionOk,
        frequencySupported: diet.scientificValidation.trainingFrequencySupported,
        supplementsAvailable: diet.suplementacao ? 
          (testCase.params.wheyProtein === diet.suplementacao.wheyProtein.available) : true
      };
      
      // Display results
      console.log('\n✅ Diet Generated Successfully!');
      console.log(`⏱️  Generation Time: ${duration.toFixed(2)}s`);
      console.log(`📝 Description: ${description}`);
      
      console.log('\n📊 User Parameters:');
      console.log(`  - Weight: ${diet.userParams.weight}kg`);
      console.log(`  - Objective: ${diet.userParams.objective}`);
      console.log(`  - Training: ${diet.userParams.trainingFrequency}x/week`);
      console.log(`  - Activity: ${diet.userParams.activityType}`);
      console.log(`  - TMB: ${diet.userParams.tmb} kcal`);
      console.log(`  - Target Calories: ${diet.userParams.targetCalories} kcal`);
      
      console.log('\n🥗 Macro Distribution:');
      console.log(`  - Carbs: ${diet.macroDistribution.carbs.percentage}% (${diet.macroDistribution.carbs.grams}g, ${diet.macroDistribution.carbs.calories} kcal)`);
      console.log(`  - Protein: ${diet.macroDistribution.protein.percentage}% (${diet.macroDistribution.protein.grams}g, ${diet.macroDistribution.protein.calories} kcal)`);
      console.log(`  - Fat: ${diet.macroDistribution.fat.percentage}% (${diet.macroDistribution.fat.grams}g, ${diet.macroDistribution.fat.calories} kcal)`);
      
      console.log('\n📈 Daily Totals:');
      console.log(`  - Calories: ${diet.dailyTotals.calories} kcal`);
      console.log(`  - Protein: ${diet.dailyTotals.protein}g`);
      console.log(`  - Carbs: ${diet.dailyTotals.carbs}g`);
      console.log(`  - Fat: ${diet.dailyTotals.fat}g`);
      
      console.log('\n🔬 Scientific Validation:');
      console.log(`  - Protein/kg: ${diet.scientificValidation.proteinPerKg.toFixed(2)}g ${validations.proteinInRange ? '✅' : '❌'} (expected ${testCase.expectedRanges.proteinPerKg.min}-${testCase.expectedRanges.proteinPerKg.max}g/kg)`);
      console.log(`  - Carbs %: ${diet.macroDistribution.carbs.percentage}% ${validations.carbsInRange ? '✅' : '❌'} (expected ${testCase.expectedRanges.carbsPercentage.min}-${testCase.expectedRanges.carbsPercentage.max}%)`);
      console.log(`  - Protein per meal OK: ${diet.scientificValidation.proteinPerMealOk ? '✅' : '❌'}`);
      console.log(`  - Macro distribution OK: ${diet.scientificValidation.macroDistributionOk ? '✅' : '❌'}`);
      console.log(`  - Frequency supported: ${diet.scientificValidation.trainingFrequencySupported ? '✅' : '❌'}`);
      console.log(`  - Carbs adequate: ${diet.scientificValidation.carbsAdequateForFrequency ? '✅' : '❌'}`);
      
      if (diet.suplementacao) {
        console.log('\n💊 Supplementation:');
        console.log(`  - Whey Protein: ${diet.suplementacao.wheyProtein.available ? '✅ Available' : '❌ Not available'}`);
        if (diet.suplementacao.wheyProtein.available && diet.suplementacao.wheyProtein.options.length > 0) {
          console.log(`    ${diet.suplementacao.wheyProtein.options[0].name}: ${diet.suplementacao.wheyProtein.options[0].quantity}`);
        }
        console.log(`  - Hypercaloric: ${diet.suplementacao.hipercalorico.available ? '✅ Available' : '❌ Not available'}`);
        if (diet.suplementacao.hipercalorico.available && diet.suplementacao.hipercalorico.options.length > 0) {
          console.log(`    ${diet.suplementacao.hipercalorico.options[0].name}: ${diet.suplementacao.hipercalorico.options[0].quantity}`);
        }
      }
      
      // Sample meal display
      console.log('\n🍳 Sample Meal (Breakfast):');
      if (diet.cafeDaManha && diet.cafeDaManha.main.length > 0) {
        diet.cafeDaManha.main.slice(0, 3).forEach(item => {
          console.log(`  - ${item.name}: ${item.quantity} (${item.calories} kcal, P:${item.protein}g, C:${item.carbs}g, F:${item.fat}g)`);
        });
        console.log(`  Total: ${diet.cafeDaManha.mealTotals.calories} kcal, P:${diet.cafeDaManha.mealTotals.protein}g`);
      }
      
      // Store result
      results.push({
        testCase: testCase.name,
        success: true,
        validations,
        duration,
        description
      });
      
    } catch (error) {
      console.error(`\n❌ Error in test ${index + 1}:`, error);
      results.push({
        testCase: testCase.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const successRate = (successCount / totalCount * 100).toFixed(1);
  
  console.log(`\n✅ Successful Tests: ${successCount}/${totalCount} (${successRate}%)`);
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`\n${index + 1}. ${result.testCase}: ✅ PASSED`);
      console.log(`   - Duration: ${result.duration.toFixed(2)}s`);
      console.log(`   - Description: ${result.description}`);
      console.log(`   - Protein in range: ${result.validations.proteinInRange ? '✅' : '❌'}`);
      console.log(`   - Carbs in range: ${result.validations.carbsInRange ? '✅' : '❌'}`);
    } else {
      console.log(`\n${index + 1}. ${result.testCase}: ❌ FAILED`);
      console.log(`   - Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('✨ All tests completed!');
}

// Run the tests
if (require.main === module) {
  testScientificPrompt()
    .then(() => {
      console.log('\n✅ Test suite completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

export { testScientificPrompt };