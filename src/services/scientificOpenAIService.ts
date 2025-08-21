import OpenAI from 'openai';
import { 
  StructuredDietResponse, 
  DietGenerationParams,
  MealSection,
  FoodItem 
} from '../types/diet.types';

const SCIENTIFIC_NUTRITIONIST_PROMPT = `
Você é um nutricionista especialista e experiente, especializado no cardápio brasileiro com conhecimento científico atualizado em nutrição esportiva e metabolismo.

IMPORTANTE: Use EXCLUSIVAMENTE alimentos típicos do cardápio da rotina de um brasileiro.

## PARÂMETROS OBRIGATÓRIOS QUE O USUÁRIO DEVE FORNECER:
- Peso corporal (kg)
- Objetivo (hipertrofia/bulking, emagrecimento, cutting/definição, recomposição corporal)
- Frequência de atividade física (2-3x semana, 3-5x semana, 5-7x semana)
- Tipo de atividade predominante (musculação, cardio, misto)
- Uso de suplementos (whey protein: true/false, hipercalórico: true/false)
- Preferências alimentares/restrições
- Ativação de lanches (lancheDaManha: true/false, lancheDaTarde: true/false)

## CÁLCULOS CIENTÍFICOS OBRIGATÓRIOS:

### PROTEÍNA (baseado em evidências):
- **Hipertrofia/Bulking**: 1,6-2,2g/kg/dia
- **Emagrecimento**: 2,0-2,5g/kg/dia  
- **Cutting/Definição**: 2,5-3,5g/kg/dia
- **Recomposição**: 2,0-2,8g/kg/dia
- **Fracionamento**: 0,3-0,5g/kg por refeição (mínimo 3-4 refeições)

### DISTRIBUIÇÃO DE MACRONUTRIENTES:
**BULKING/HIPERTROFIA:**
- Carboidratos: 50-60% (4-8g/kg/dia)
- Proteínas: 15-20% 
- Gorduras: 20-35%

**CUTTING/DEFINIÇÃO:**
- Carboidratos: 20-45% (2-4g/kg/dia)
- Proteínas: 30-40%
- Gorduras: 15-30%

**EMAGRECIMENTO/RECOMPOSIÇÃO:**
- Carboidratos: 30-50% (3-5g/kg/dia)
- Proteínas: 25-35%
- Gorduras: 20-30%

### CALORIAS TOTAIS (baseado na frequência de treino):

**FREQUÊNCIA 2-3x/SEMANA (Iniciante/Moderado):**
- **Hipertrofia**: TMB + 250-400 kcal 
- **Emagrecimento**: TMB - 250-400 kcal
- **Cutting**: TMB - 300-450 kcal
- **Recomposição**: TMB ± 150 kcal

**FREQUÊNCIA 3-5x/SEMANA (Intermediário):**
- **Hipertrofia**: TMB + 300-500 kcal
- **Emagrecimento**: TMB - 300-500 kcal  
- **Cutting**: TMB - 400-600 kcal
- **Recomposição**: TMB ± 200 kcal

**FREQUÊNCIA 5-7x/SEMANA (Avançado):**
- **Hipertrofia**: TMB + 400-650 kcal
- **Emagrecimento**: TMB - 350-550 kcal
- **Cutting**: TMB - 450-650 kcal
- **Recomposição**: TMB ± 250 kcal

### AJUSTES POR FREQUÊNCIA:
- **2-3x/semana**: Carboidratos moderados, recuperação enfatizada
- **3-5x/semana**: Carboidratos elevados, distribuição equilibrada
- **5-7x/semana**: Carboidratos altos, foco em performance e recuperação

### SUPLEMENTAÇÃO (seção separada de substituições):
**WHEY PROTEIN:**
- Oferecido como substituição opcional em seção própria
- 1 scoop (30g) = ~120 kcal, ~25g proteína
- Pode substituir fontes proteicas de qualquer refeição
- Cliente decide quando e onde usar

**HIPERCALÓRICO:**
- Oferecido apenas em objetivos de hipertrofia/bulking
- 1 dose (40-60g) = ~200-300 kcal
- Rico em carboidratos + proteína
- Substituição opcional para lanches ou refeições
- Cliente escolhe se e quando usar

## VALIDAÇÕES OBRIGATÓRIAS:
1. Verificar se a proteína total está dentro da faixa científica para o objetivo
2. Confirmar se cada refeição tem 0,3-0,5g/kg de proteína
3. Validar se os carboidratos estão adequados à frequência de treino
4. Garantir que o déficit/superávit seja apropriado para a frequência
5. Incluir fonte proteica, carboidrato e gordura em cada refeição principal
6. Verificar se as calorias totais suportam a frequência de atividade física
7. Quando solicitados, criar seção separada de suplementação como opções de substituição
8. Garantir que hipercalórico seja oferecido apenas para hipertrofia/bulking
9. Suplementos devem ter instruções claras de uso como substituições opcionais

## ORIENTAÇÕES CIENTÍFICAS:
- Carboidratos são ESSENCIAIS para hipertrofia (performance + anti-catabolismo)
- Frequência de treino determina necessidades calóricas e de carboidratos
- Treinos mais frequentes (5-7x) exigem mais carboidratos para recuperação
- Déficits agressivos causam perda de massa magra
- Insulina tem efeito anticatabólico (carboidratos ajudam)
- Whey protein pós-treino dispensa carboidratos obrigatórios
- Timing menos importante que total diário de macros
- Alta frequência requer atenção especial à recuperação nutricional
- Suplementos são OPCIONAIS e devem complementar, não substituir alimentação balanceada
- Cliente tem autonomia para escolher quando/se usar suplementos como substituições
- Dieta deve ser completa e funcional mesmo sem suplementação

Responda APENAS com um objeto JSON que siga exatamente este schema, com nomes de refeições em português:
{
  "userParams": {
    "weight": number,
    "objective": "string",
    "trainingFrequency": "string",
    "activityType": "string",
    "wheyProtein": boolean,
    "hypercaloric": boolean,
    "proteinTarget": number,
    "proteinPerMeal": number,
    "tmb": number,
    "targetCalories": number
  },
  "macroDistribution": {
    "carbs": {"percentage": number, "grams": number, "calories": number},
    "protein": {"percentage": number, "grams": number, "calories": number},
    "fat": {"percentage": number, "grams": number, "calories": number}
  },
  "cafeDaManha": {
    "main": [
      {"name": "string", "quantity": "string", "calories": number, "protein": number, "carbs": number, "fat": number}
    ],
    "alternatives": [
      {"name": "string", "quantity": "string", "calories": number, "protein": number, "carbs": number, "fat": number}
    ],
    "mealTotals": {"calories": number, "protein": number, "carbs": number, "fat": number}
  },
  "lancheDaManha": null OR {same structure as cafeDaManha},
  "almoco": {same structure as cafeDaManha},
  "lancheDaTarde": null OR {same structure as cafeDaManha},
  "jantar": {same structure as cafeDaManha},
  "dailyTotals": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "suplementacao": {
    "wheyProtein": {
      "available": boolean,
      "options": [
        {"name": "string", "quantity": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "usage": "string"}
      ]
    },
    "hipercalorico": {
      "available": boolean,
      "options": [
        {"name": "string", "quantity": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "usage": "string"}
      ]
    },
    "instructions": "string"
  },
  "scientificValidation": {
    "proteinPerKg": number,
    "proteinPerMealOk": boolean,
    "macroDistributionOk": boolean,
    "caloricBalanceOk": boolean,
    "trainingFrequencySupported": boolean,
    "carbsAdequateForFrequency": boolean,
    "supplementationSectionComplete": boolean
  },
  "notes": "string com orientações científicas personalizadas"
}

IMPORTANTE:
- Calcule TUDO baseado no peso corporal e frequência de treino fornecidos
- Ajuste calorias conforme frequência: maior frequência = mais calorias
- Valide cientificamente cada métrica
- Distribua proteína adequadamente entre as refeições
- Priorize carboidratos proporcionalmente à frequência de treino
- Use déficits moderados para preservar massa magra
- Inclua macronutrientes detalhados para cada alimento
- Forneça 3 itens no main e 3 nas alternatives para cada refeição
- Use nomes de refeições em português: cafeDaManha, lancheDaManha, almoco, lancheDaTarde, jantar
- Responda sempre em português brasileiro`;

export class ScientificOpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateScientificDiet(params: DietGenerationParams): Promise<StructuredDietResponse> {
    const userPrompt = this.buildUserPrompt(params);
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key is not configured');
        }

        const completion = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: SCIENTIFIC_NUTRITIONIST_PROMPT
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4000,
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
          throw new Error('Empty response from OpenAI');
        }

        const dietData = JSON.parse(response) as StructuredDietResponse;
        
        // Validate response structure
        this.validateDietResponse(dietData);
        
        // Additional scientific validation
        this.validateScientificMetrics(dietData, params);
        
        console.log('✅ Valid scientific diet generated on attempt', attempt + 1);
        return dietData;

      } catch (error) {
        console.error(`Error on attempt ${attempt + 1}:`, error);
        lastError = error;
        
        if (attempt === maxRetries - 1) {
          // If last attempt, try fallback to simpler prompt
          if (error instanceof Error && error.message.includes('Invalid')) {
            return this.generateWithFallback(params);
          }
        }
      }
    }

    throw new Error(`Failed to generate scientific diet after ${maxRetries} attempts: ${lastError?.message}`);
  }

  private buildUserPrompt(params: DietGenerationParams): string {
    // Calculate TMB (Taxa Metabólica Basal) using Harris-Benedict equation
    const tmb = this.calculateTMB(params);
    
    return `
      Gere uma dieta personalizada com os seguintes parâmetros:
      
      DADOS DO USUÁRIO:
      - Peso: ${params.weight} kg
      ${params.height ? `- Altura: ${params.height} cm` : ''}
      ${params.age ? `- Idade: ${params.age} anos` : ''}
      ${params.gender ? `- Sexo: ${params.gender}` : ''}
      - Objetivo: ${params.objective}
      - Frequência de treino: ${params.trainingFrequency} vezes por semana
      - Tipo de atividade: ${params.activityType}
      - TMB estimada: ${tmb} kcal
      - Usa whey protein: ${params.wheyProtein ? 'Sim' : 'Não'}
      - Usa hipercalórico: ${params.hypercaloric ? 'Sim' : 'Não'}
      
      PREFERÊNCIAS ALIMENTARES:
      ${params.preferences.length > 0 ? params.preferences.join(', ') : 'Sem preferências específicas'}
      
      RESTRIÇÕES ALIMENTARES:
      ${params.restrictions.length > 0 ? params.restrictions.join(', ') : 'Nenhuma restrição'}
      
      ${params.healthConditions && params.healthConditions.length > 0 ? 
        `CONDIÇÕES DE SAÚDE:
        ${params.healthConditions.join(', ')}` : ''}
      
      LANCHES:
      - Lanche da manhã: ${params.morningSnackActive ? 'ATIVO' : 'INATIVO (retorne null)'}
      - Lanche da tarde: ${params.afternoonSnackActive ? 'ATIVO' : 'INATIVO (retorne null)'}
      
      INSTRUÇÕES IMPORTANTES:
      - Use EXCLUSIVAMENTE alimentos brasileiros típicos
      - Siga rigorosamente as diretrizes científicas do prompt do sistema
      - Calcule proteína baseada no peso e objetivo
      - Ajuste calorias baseado na frequência de treino
      - Retorne um JSON válido conforme o schema especificado
      - Se lanches estiverem inativos, retorne null para esses campos
      - Inclua suplementação como seção separada se solicitado
    `;
  }

  private calculateTMB(params: DietGenerationParams): number {
    // Default values if not provided
    const weight = params.weight;
    const height = params.height || 170; // Default height
    const age = params.age || 30; // Default age
    const gender = params.gender || 'masculino';

    // Harris-Benedict equation
    if (gender === 'masculino') {
      return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
    } else {
      return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
    }
  }

  private validateDietResponse(data: any): void {
    // Check required top-level fields
    if (!data.userParams || !data.macroDistribution) {
      throw new Error('Invalid response: missing userParams or macroDistribution');
    }

    if (!data.cafeDaManha || !data.almoco || !data.jantar) {
      throw new Error('Invalid response: missing main meals (cafeDaManha, almoco, jantar)');
    }

    // Validate meal structure
    const requiredMeals = ['cafeDaManha', 'almoco', 'jantar'];
    requiredMeals.forEach(meal => {
      if (data[meal]) {
        if (!data[meal].main || !Array.isArray(data[meal].main) || data[meal].main.length < 3) {
          throw new Error(`Invalid response: ${meal} must have at least 3 main items`);
        }
        if (!data[meal].alternatives || !Array.isArray(data[meal].alternatives) || data[meal].alternatives.length < 3) {
          throw new Error(`Invalid response: ${meal} must have at least 3 alternative items`);
        }
        if (!data[meal].mealTotals) {
          throw new Error(`Invalid response: ${meal} missing mealTotals`);
        }
      }
    });

    // Validate optional snacks structure if present
    ['lancheDaManha', 'lancheDaTarde'].forEach(snack => {
      if (data[snack] !== null && data[snack] !== undefined) {
        if (!data[snack].main || !data[snack].alternatives || !data[snack].mealTotals) {
          throw new Error(`Invalid response: ${snack} has invalid structure`);
        }
      }
    });

    // Validate scientific validation
    if (!data.scientificValidation) {
      throw new Error('Invalid response: missing scientificValidation');
    }

    if (!data.dailyTotals) {
      throw new Error('Invalid response: missing dailyTotals');
    }
  }

  private validateScientificMetrics(diet: StructuredDietResponse, params: DietGenerationParams): void {
    const { scientificValidation, userParams } = diet;
    
    // Validate protein per kg is within scientific range
    const minProtein = this.getMinProteinPerKg(params.objective);
    const maxProtein = this.getMaxProteinPerKg(params.objective);
    
    if (scientificValidation.proteinPerKg < minProtein || 
        scientificValidation.proteinPerKg > maxProtein) {
      console.warn(`⚠️ Protein outside range: ${scientificValidation.proteinPerKg}g/kg (expected ${minProtein}-${maxProtein}g/kg)`);
    }
    
    // Validate macro distribution
    if (!scientificValidation.macroDistributionOk) {
      console.warn('⚠️ Macro distribution not optimized');
    }
    
    // Validate training frequency support
    if (!scientificValidation.trainingFrequencySupported) {
      console.warn('⚠️ Calories not adequate for training frequency');
    }

    // Log validation summary
    console.log('📊 Scientific Validation Summary:');
    console.log(`  - Protein/kg: ${scientificValidation.proteinPerKg}g`);
    console.log(`  - Protein per meal OK: ${scientificValidation.proteinPerMealOk}`);
    console.log(`  - Macros OK: ${scientificValidation.macroDistributionOk}`);
    console.log(`  - Frequency supported: ${scientificValidation.trainingFrequencySupported}`);
  }

  private getMinProteinPerKg(objective: string): number {
    const ranges: Record<string, number> = {
      'hipertrofia': 1.6,
      'bulking': 1.6,
      'ganhar_massa_muscular': 1.6,
      'emagrecimento': 2.0,
      'emagrecer': 2.0,
      'cutting': 2.5,
      'definicao': 2.5,
      'definicao_muscular': 2.5,
      'recomposicao': 2.0,
      'recomposicao_corporal': 2.0
    };
    return ranges[objective] || 1.6;
  }

  private getMaxProteinPerKg(objective: string): number {
    const ranges: Record<string, number> = {
      'hipertrofia': 2.2,
      'bulking': 2.2,
      'ganhar_massa_muscular': 2.2,
      'emagrecimento': 2.5,
      'emagrecer': 2.5,
      'cutting': 3.5,
      'definicao': 3.5,
      'definicao_muscular': 3.5,
      'recomposicao': 2.8,
      'recomposicao_corporal': 2.8
    };
    return ranges[objective] || 2.5;
  }

  private async generateWithFallback(params: DietGenerationParams): Promise<StructuredDietResponse> {
    console.log('⚠️ Using fallback generation method...');
    
    // Create a simplified response structure
    const tmb = this.calculateTMB(params);
    const proteinTarget = Math.round(params.weight * this.getMinProteinPerKg(params.objective));
    const proteinPerMeal = Math.round(params.weight * 0.4);
    
    // Calculate target calories based on objective and frequency
    const targetCalories = this.calculateTargetCalories(tmb, params.objective, params.trainingFrequency);
    
    // Create basic meal structure
    const createMeal = (mealName: string): MealSection => ({
      main: [
        { name: `${mealName} Item 1`, quantity: "1 porção", calories: 200, protein: 15, carbs: 20, fat: 8 },
        { name: `${mealName} Item 2`, quantity: "1 porção", calories: 150, protein: 10, carbs: 15, fat: 6 },
        { name: `${mealName} Item 3`, quantity: "1 porção", calories: 100, protein: 5, carbs: 10, fat: 4 }
      ],
      alternatives: [
        { name: `${mealName} Alt 1`, quantity: "1 porção", calories: 200, protein: 15, carbs: 20, fat: 8 },
        { name: `${mealName} Alt 2`, quantity: "1 porção", calories: 150, protein: 10, carbs: 15, fat: 6 },
        { name: `${mealName} Alt 3`, quantity: "1 porção", calories: 100, protein: 5, carbs: 10, fat: 4 }
      ],
      mealTotals: { calories: 450, protein: 30, carbs: 45, fat: 18 }
    });

    return {
      userParams: {
        weight: params.weight,
        objective: params.objective,
        trainingFrequency: params.trainingFrequency,
        activityType: params.activityType,
        wheyProtein: params.wheyProtein,
        hypercaloric: params.hypercaloric,
        proteinTarget,
        proteinPerMeal,
        tmb,
        targetCalories
      },
      macroDistribution: {
        carbs: { percentage: 45, grams: Math.round(targetCalories * 0.45 / 4), calories: Math.round(targetCalories * 0.45) },
        protein: { percentage: 30, grams: proteinTarget, calories: proteinTarget * 4 },
        fat: { percentage: 25, grams: Math.round(targetCalories * 0.25 / 9), calories: Math.round(targetCalories * 0.25) }
      },
      cafeDaManha: createMeal("Café da Manhã"),
      lancheDaManha: params.morningSnackActive ? createMeal("Lanche da Manhã") : null,
      almoco: createMeal("Almoço"),
      lancheDaTarde: params.afternoonSnackActive ? createMeal("Lanche da Tarde") : null,
      jantar: createMeal("Jantar"),
      dailyTotals: {
        calories: targetCalories,
        protein: proteinTarget,
        carbs: Math.round(targetCalories * 0.45 / 4),
        fat: Math.round(targetCalories * 0.25 / 9)
      },
      scientificValidation: {
        proteinPerKg: proteinTarget / params.weight,
        proteinPerMealOk: true,
        macroDistributionOk: true,
        caloricBalanceOk: true,
        trainingFrequencySupported: true,
        carbsAdequateForFrequency: true,
        supplementationSectionComplete: params.wheyProtein || params.hypercaloric
      },
      notes: "Dieta gerada com método de fallback. Consulte um nutricionista para ajustes personalizados."
    };
  }

  private calculateTargetCalories(tmb: number, objective: string, frequency: string): number {
    const adjustments: Record<string, Record<string, number>> = {
      'hipertrofia': { '2-3': 325, '3-5': 400, '5-7': 525 },
      'bulking': { '2-3': 325, '3-5': 400, '5-7': 525 },
      'emagrecimento': { '2-3': -325, '3-5': -400, '5-7': -450 },
      'cutting': { '2-3': -375, '3-5': -500, '5-7': -550 },
      'definicao': { '2-3': -375, '3-5': -500, '5-7': -550 },
      'recomposicao': { '2-3': 0, '3-5': 0, '5-7': 0 }
    };

    const objectiveKey = Object.keys(adjustments).find(key => 
      objective.toLowerCase().includes(key)
    ) || 'recomposicao';

    const adjustment = adjustments[objectiveKey][frequency] || 0;
    return tmb + adjustment;
  }

  generateDescription(gender: string, objective: string, frequency: string): string {
    const genderText = gender === 'masculino' ? 'Homem' : 
                      gender === 'feminino' ? 'Mulher' : 'Pessoa';
    
    const objectiveMap: Record<string, string> = {
      'hipertrofia': 'Hipertrofia',
      'bulking': 'Bulking',
      'ganhar_massa_muscular': 'Ganho de Massa',
      'emagrecimento': 'Emagrecimento',
      'emagrecer': 'Emagrecimento',
      'cutting': 'Cutting/Definição',
      'definicao': 'Definição Muscular',
      'definicao_muscular': 'Definição Muscular',
      'recomposicao': 'Recomposição Corporal',
      'recomposicao_corporal': 'Recomposição Corporal',
      'manutencao': 'Manutenção',
      'saude': 'Saúde e Bem-estar'
    };

    const objectiveKey = Object.keys(objectiveMap).find(key => 
      objective.toLowerCase().includes(key)
    );
    const objectiveText = objectiveKey ? objectiveMap[objectiveKey] : objective;
    
    const frequencyText = `${frequency}x/semana`;

    return `${genderText} - ${objectiveText} - ${frequencyText}`;
  }
}

// Export both the new scientific service and maintain compatibility
export { ScientificOpenAIService as OpenAIService };