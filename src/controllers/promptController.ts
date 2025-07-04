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

    // Step 1: Create Diet record BEFORE OpenAI call
    const dietRepository = AppDataSource.getRepository(Diet);
    const diet = dietRepository.create({
      userId: userData.id,
      prompt: nutritionPrompt,
      aiResponse: '', // Empty initially, will be filled after payment
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

    // Step 2: Create order in membros-api
    const membrosApiService = new MembrosApiService();
    
    const orderData = {
      projectId: process.env.MEMBROS_PROJECT_ID!,
      closed: true,
      customer: {
        id: userData.id,
        name: userData.email.split('@')[0] || 'Customer',
        type: 'individual' as const,
        email: userData.email,
        document: '00000000000', // Default CPF - could be made configurable
        phones: {
          mobile_phone: {
            country_code: '55',
            area_code: userData.phoneNumber?.substring(0, 2) || '11',
            number: userData.phoneNumber?.substring(2) || '999999999'
          }
        },
        address: {
          street: 'Rua Principal',
          number: 123,
          zip_code: '01000000',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          country: 'BR'
        }
      },
      items: [
        {
          amount: 2999, // R$ 29.99 in cents
          description: 'Plano Nutricional Personalizado',
          quantity: 1
        }
      ],
      totalAmount: 2999 // R$ 29.99 in cents
    };

    const membrosOrder = await membrosApiService.createOrder(orderData);

    // Step 3: Update Diet record with payment info
    diet.membrosOrderId = membrosOrder.id;
    diet.membrosOrderStatus = membrosOrder.status;
    
    // Extract PIX QR code URL from the payments array
    const pixPayment = membrosOrder.payments.find(p => p.payment_method === 'pix');
    if (pixPayment?.pix_qr_code_url) {
      diet.pixQrCodeUrl = pixPayment.pix_qr_code_url;
    }

    await dietRepository.save(diet);

    // Step 4: Return lean response
    return reply.send({
      dietId: diet.id,
      pixQrCodeUrl: diet.pixQrCodeUrl
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