import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { UserData } from '../entities/UserData';
import { GeneratedPrompt } from '../entities/GeneratedPrompt';
import { 
  Objetivo, 
  CaloriasDiarias, 
  HorariosRefeicoesOption, 
  Genero, 
  NivelAtividade, 
  TipoPlanoTreino 
} from '../types/enums';
import { generatePromptSchema } from '../types/prompt';
import { OpenAIService } from '../services/openaiService';

interface GeneratePromptRequestBody {
  weight: string;
  height: string;
  age: string;
  goal: string;
  calories: string;
  gender: string;
  schedule: string;
  activityLevel: string;
  workoutPlan: string;
  breakfast: string;
  morningSnack: string;
  lunch: string;
  afternoonSnack: string;
  dinner: string;
}

export const generatePrompt = async (
  request: FastifyRequest<{ Body: GeneratePromptRequestBody }>,
  reply: FastifyReply
) => {
  try {
    // Validate request body
    const validation = generatePromptSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid request data',
        details: validation.error.errors
      });
    }

    const {
      weight,
      height,
      age,
      goal,
      calories,
      gender,
      schedule,
      activityLevel,
      workoutPlan,
      breakfast,
      morningSnack,
      lunch,
      afternoonSnack,
      dinner
    } = validation.data;

    // Get user ID from JWT token (set by authentication middleware)
    const userId = request.user.userId;

    // Find user by ID
    const userDataRepository = AppDataSource.getRepository(UserData);
    let userData = await userDataRepository.findOne({ where: { id: userId } });

    if (!userData) {
      return reply.status(404).send({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Update user data with validated information
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);

    userData.peso = weightNum;
    userData.altura = heightNum;
    userData.idade = ageNum;
    userData.objetivo = goal as Objetivo;
    userData.caloriasDiarias = calories as CaloriasDiarias;
    userData.genero = gender as Genero;
    userData.horariosParaRefeicoes = schedule as HorariosRefeicoesOption;
    userData.nivelAtividade = activityLevel as NivelAtividade;
    userData.planoTreino = workoutPlan as TipoPlanoTreino;
    userData.cafeDaManha = breakfast.split(',').map((item: string) => item.trim());
    userData.lancheDaManha = morningSnack.split(',').map((item: string) => item.trim());
    userData.almoco = lunch.split(',').map((item: string) => item.trim());
    userData.lancheDaTarde = afternoonSnack.split(',').map((item: string) => item.trim());
    userData.janta = dinner.split(',').map((item: string) => item.trim());

    // Save updated user data
    await userDataRepository.save(userData);

    // Create the prompt for OpenAI
    const nutritionPrompt = `
Você é um nutricionista especializado em criar planos alimentares personalizados. Com base nos dados fornecidos, crie um plano nutricional detalhado.

DADOS DO USUÁRIO:
- Peso: ${userData.peso}kg
- Altura: ${userData.altura}cm
- Idade: ${userData.idade} anos
- Gênero: ${userData.genero}
- Objetivo: ${userData.objetivo}
- Meta de calorias: ${userData.caloriasDiarias} kcal/dia
- Nível de atividade: ${userData.nivelAtividade}
- Tipo de treino: ${userData.planoTreino}
- Horários das refeições: ${userData.horariosParaRefeicoes}

PREFERÊNCIAS ALIMENTARES:
- Café da manhã: ${userData.cafeDaManha.join(', ')}
- Lanche da manhã: ${userData.lancheDaManha.join(', ')}
- Almoço: ${userData.almoco.join(', ')}
- Lanche da tarde: ${userData.lancheDaTarde.join(', ')}
- Jantar: ${userData.janta.join(', ')}

INSTRUÇÕES:
1. Crie um plano alimentar completo para uma semana
2. Distribua as calorias adequadamente entre as refeições
3. Considere o objetivo (ganhar peso, perder peso, manter peso)
4. Inclua as preferências alimentares mencionadas
5. Ajuste as porções conforme o nível de atividade física
6. Forneça dicas nutricionais específicas para o objetivo
7. Inclua informações sobre hidratação
8. Sugira suplementação se necessário

Por favor, forneça o plano alimentar estruturado e detalhado.
    `.trim();

    // Generate AI response using OpenAI
    const aiResponse = await OpenAIService.generateNutritionPlan(nutritionPrompt);

    // Save the generated prompt and AI response to database
    const generatedPromptRepository = AppDataSource.getRepository(GeneratedPrompt);
    const generatedPrompt = generatedPromptRepository.create({
      userId: userData.id,
      prompt: nutritionPrompt,
      aiResponse,
      userData: {
        weight: userData.peso,
        height: userData.altura,
        age: userData.idade,
        goal: userData.objetivo,
        dailyCalories: userData.caloriasDiarias,
        gender: userData.genero,
        mealSchedule: userData.horariosParaRefeicoes,
        activityLevel: userData.nivelAtividade,
        workoutPlan: userData.planoTreino,
        breakfast: userData.cafeDaManha,
        morningSnack: userData.lancheDaManha,
        lunch: userData.almoco,
        afternoonSnack: userData.lancheDaTarde,
        dinner: userData.janta
      }
    });

    await generatedPromptRepository.save(generatedPrompt);

    return reply.send({
      success: true,
      prompt: nutritionPrompt,
      aiResponse,
      data: {
        userId: userData.id,
        weight: userData.peso,
        height: userData.altura,
        age: userData.idade,
        goal: userData.objetivo,
        dailyCalories: userData.caloriasDiarias,
        gender: userData.genero,
        mealSchedule: userData.horariosParaRefeicoes,
        activityLevel: userData.nivelAtividade,
        workoutPlan: userData.planoTreino,
        breakfast: userData.cafeDaManha,
        morningSnack: userData.lancheDaManha,
        lunch: userData.almoco,
        afternoonSnack: userData.lancheDaTarde,
        dinner: userData.janta
      }
    });
  } catch (error) {
    console.error('Erro ao gerar prompt:', error);
    return reply.status(500).send({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const getGeneratedPrompt = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Get user ID from JWT token
    const userId = request.user.userId;

    // Get the most recent generated prompt for this user
    const generatedPromptRepository = AppDataSource.getRepository(GeneratedPrompt);
    const generatedPrompt = await generatedPromptRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    if (!generatedPrompt) {
      return reply.status(404).send({
        success: false,
        error: 'Nenhum plano nutricional foi gerado ainda para este usuário'
      });
    }

    return reply.send({
      success: true,
      data: {
        id: generatedPrompt.id,
        userId: generatedPrompt.userId,
        prompt: generatedPrompt.prompt,
        aiResponse: generatedPrompt.aiResponse,
        userData: generatedPrompt.userData,
        createdAt: generatedPrompt.createdAt,
        updatedAt: generatedPrompt.updatedAt
      }
    });
  } catch (error) {
    console.error('Erro ao buscar plano nutricional gerado:', error);
    return reply.status(500).send({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};