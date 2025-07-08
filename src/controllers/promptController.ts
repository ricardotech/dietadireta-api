import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { UserData } from '../entities/UserData';
import { Diet } from '../entities/Diet';
import { 
  Objetivo, 
  HorariosRefeicoesOption, 
  Genero, 
  NivelAtividade, 
  TipoPlanoTreino,
  OrderStatus
} from '../types/enums';
import { generatePromptSchema } from '../types/prompt';
import { OpenAIService } from '../services/openaiService';
import { MembrosApiService } from '../services/membrosApiService';

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
    userData.caloriasDiarias = parseInt(calories);
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

    // Create the prompt for OpenAI (but don't send it yet)
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

    // Step 1: Generate AI diet using OpenAI
    const aiResponse = await OpenAIService.generateNutritionPlan(nutritionPrompt);

    // Step 2: Create Diet record with AI response
    const dietRepository = AppDataSource.getRepository(Diet);
    const diet = dietRepository.create({
      userId: userData.id,
      prompt: nutritionPrompt,
      aiResponse: aiResponse,
      orderStatus: OrderStatus.PENDING,
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

    await dietRepository.save(diet);

    // Step 3: Create order in membros-api
    const membrosApiService = new MembrosApiService();
    
    const orderData = {
      closed: true,
      customer_id: userData.id,
      items: [
        {
          amount: 990, // R$ 9,90 in cents
          description: 'Plano Nutricional Personalizado',
          quantity: 1
        }
      ],
      totalAmount: 990
    };

    const membrosOrder = await membrosApiService.createOrder(orderData);

    console.log('Membros API Response:', JSON.stringify(membrosOrder, null, 2));

    // Step 4: Update Diet record with payment info
    diet.membrosOrderId = membrosOrder.id;
    diet.membrosOrderStatus = membrosOrder.status;
    
    // Extract PIX QR code URL from last_transaction
    if (membrosOrder.last_transaction?.qr_code_url) {
      diet.pixQrCodeUrl = membrosOrder.last_transaction.qr_code_url;
    }

    await dietRepository.save(diet);

    // Step 5: Return response with QR code URL
    return reply.send({
      success: true,
      data: {
        dietId: diet.id,
        orderId: membrosOrder.id,
        qrCodeUrl: membrosOrder.last_transaction?.qr_code_url,
        status: membrosOrder.status,
        amount: membrosOrder.amount,
        expiresAt: membrosOrder.last_transaction?.expires_at
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

export const getDiet = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Get user ID from JWT token
    const userId = request.user.userId;

    // Get the most recent diet plan for this user
    const dietRepository = AppDataSource.getRepository(Diet);
    const diet = await dietRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    if (!diet) {
      return reply.status(404).send({
        success: false,
        error: 'Nenhum plano nutricional foi gerado ainda para este usuário'
      });
    }

    return reply.send({
      success: true,
      data: {
        id: diet.id,
        userId: diet.userId,
        prompt: diet.prompt,
        aiResponse: diet.aiResponse,
        orderId: diet.orderId,
        orderStatus: diet.orderStatus,
        userData: diet.userData,
        createdAt: diet.createdAt,
        updatedAt: diet.updatedAt
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

export const checkPaymentStatus = async (
  request: FastifyRequest<{ Params: { orderId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { orderId } = request.params;
    const userId = request.user.userId;

    // Find the diet record by membrosOrderId and userId
    const dietRepository = AppDataSource.getRepository(Diet);
    const diet = await dietRepository.findOne({
      where: { membrosOrderId: orderId, userId }
    });

    if (!diet) {
      return reply.status(404).send({
        success: false,
        error: 'Order not found'
      });
    }

    // Check payment status with Membros API
    const membrosApiService = new MembrosApiService();
    const orderStatus = await membrosApiService.getOrder(orderId);

    console.log('Order status from Membros API:', orderStatus);

    // Update local status
    diet.membrosOrderStatus = orderStatus.status;
    await dietRepository.save(diet);

    // If payment is confirmed and diet is ready, return the diet
    if (orderStatus.status === 'paid' && diet.aiResponse) {
      return reply.send({
        success: true,
        paid: true,
        data: {
          dietId: diet.id,
          aiResponse: diet.aiResponse,
          orderStatus: orderStatus.status,
          createdAt: diet.createdAt
        }
      });
    }

    // If payment is confirmed but diet is not ready yet
    if (orderStatus.status === 'paid' && !diet.aiResponse) {
      return reply.send({
        success: true,
        paid: true,
        processing: true,
        message: 'Payment confirmed. Diet is being generated...'
      });
    }

    // Payment not confirmed yet
    return reply.send({
      success: true,
      paid: false,
      status: orderStatus.status,
      message: 'Payment not confirmed yet'
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
};