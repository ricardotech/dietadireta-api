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

// Function to parse phone number from format (11) 91579-9139 to Membros API format
function parsePhoneNumber(phoneNumber: string): { country_code: string; area_code: string; number: string } {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If less than 10 digits, use fallback
  if (digitsOnly.length < 10) {
    return {
      country_code: '55',
      area_code: '11',
      number: '900000000'
    };
  }
  
  // Extract area code (first 2 digits) and number (remaining digits)
  const areaCode = digitsOnly.substring(0, 2);
  const number = digitsOnly.substring(2);
  
  return {
    country_code: '55',
    area_code: areaCode,
    number: number
  };
}

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

    // Create Diet record without AI response (will be generated after payment)
    const dietRepository = AppDataSource.getRepository(Diet);
    const diet = dietRepository.create({
      userId: userData.id,
      prompt: nutritionPrompt,
      aiResponse: '', // Will be filled after payment confirmation
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

    // Return the diet ID for checkout
    return reply.send({
      success: true,
      data: {
        dietId: diet.id,
        message: 'Diet plan created successfully. Use the dietId to proceed with checkout.'
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

export const createCheckout = async (
  request: FastifyRequest<{ Body: { dietId?: string; userData?: any; userInfo?: any } }>,
  reply: FastifyReply
) => {
  try {
    const { dietId, userData: requestUserData, userInfo } = request.body;
    const userId = request.user.userId;

    console.log('Checkout request:', { dietId, hasUserData: !!requestUserData, hasUserInfo: !!userInfo, userId });

    let diet: any = null;

    // Try to find existing diet if dietId is provided
    if (dietId) {
      const dietRepository = AppDataSource.getRepository(Diet);
      diet = await dietRepository.findOne({
        where: { id: dietId, userId }
      });
      console.log('Found existing diet:', !!diet);
    }

    // If no diet found and we have userData, create a new one
    if (!diet && requestUserData) {
      console.log('Creating new diet with provided userData');
      
      // Get user data from database
      const userDataRepository = AppDataSource.getRepository(UserData);
      let userRecord = await userDataRepository.findOne({
        where: { id: userId }
      });

      if (!userRecord) {
        return reply.status(404).send({
          success: false,
          error: 'User data not found'
        });
      }

      // Update user record with provided data if available
      if (requestUserData.weight) userRecord.peso = parseFloat(requestUserData.weight);
      if (requestUserData.height) userRecord.altura = parseFloat(requestUserData.height);
      if (requestUserData.age) userRecord.idade = parseInt(requestUserData.age);
      if (requestUserData.goal) {
        // Map goal to proper enum value that matches the database enum
        const goalMapping: Record<string, string> = {
          'emagrecer': 'emagrecer',
          'emagrecer_massa': 'emagrecer+massa',
          'emagrecer+massa': 'emagrecer+massa',
          'ganhar_massa': 'ganhar massa muscular',
          'ganhar massa muscular': 'ganhar massa muscular',
          'definicao_ganho': 'definicao muscular + ganhar massa',
          'definicao muscular + ganhar massa': 'definicao muscular + ganhar massa'
        };
        userRecord.objetivo = goalMapping[requestUserData.goal] || requestUserData.goal;
      }
      if (requestUserData.calories) userRecord.caloriasDiarias = parseInt(requestUserData.calories);
      if (requestUserData.gender) userRecord.genero = requestUserData.gender;
      if (requestUserData.schedule) userRecord.horariosParaRefeicoes = requestUserData.schedule;
      if (requestUserData.activityLevel) userRecord.nivelAtividade = requestUserData.activityLevel;
      if (requestUserData.workoutPlan) userRecord.planoTreino = requestUserData.workoutPlan;

      // Update meal preferences if provided
      if (requestUserData.breakfast) {
        userRecord.cafeDaManha = requestUserData.breakfast.split(', ').filter((item: string) => item.trim());
      }
      if (requestUserData.morningSnack) {
        userRecord.lancheDaManha = requestUserData.morningSnack.split(', ').filter((item: string) => item.trim());
      }
      if (requestUserData.lunch) {
        userRecord.almoco = requestUserData.lunch.split(', ').filter((item: string) => item.trim());
      }
      if (requestUserData.afternoonSnack) {
        userRecord.lancheDaTarde = requestUserData.afternoonSnack.split(', ').filter((item: string) => item.trim());
      }
      if (requestUserData.dinner) {
        userRecord.janta = requestUserData.dinner.split(', ').filter((item: string) => item.trim());
      }

      await userDataRepository.save(userRecord);

      // Create the diet prompt
      const nutritionPrompt = `
Você é um nutricionista especializado em criar planos alimentares personalizados. Com base nos dados fornecidos, crie um plano nutricional detalhado.

DADOS DO USUÁRIO:
- Peso: ${userRecord.peso}kg
- Altura: ${userRecord.altura}cm
- Idade: ${userRecord.idade} anos
- Gênero: ${userRecord.genero}
- Objetivo: ${userRecord.objetivo}
- Meta de calorias: ${userRecord.caloriasDiarias} kcal/dia
- Nível de atividade: ${userRecord.nivelAtividade}
- Tipo de treino: ${userRecord.planoTreino}
- Horários das refeições: ${userRecord.horariosParaRefeicoes}

PREFERÊNCIAS ALIMENTARES:
- Café da manhã: ${userRecord.cafeDaManha.join(', ')}
- Lanche da manhã: ${userRecord.lancheDaManha.join(', ')}
- Almoço: ${userRecord.almoco.join(', ')}
- Lanche da tarde: ${userRecord.lancheDaTarde.join(', ')}
- Jantar: ${userRecord.janta.join(', ')}

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

      // Create new Diet record
      const dietRepository = AppDataSource.getRepository(Diet);
      diet = dietRepository.create({
        userId: userRecord.id,
        prompt: nutritionPrompt,
        aiResponse: '', // Will be filled after payment confirmation
        orderStatus: OrderStatus.PENDING,
        userData: {
          weight: userRecord.peso,
          height: userRecord.altura,
          age: userRecord.idade,
          goal: userRecord.objetivo,
          dailyCalories: userRecord.caloriasDiarias,
          gender: userRecord.genero,
          mealSchedule: userRecord.horariosParaRefeicoes,
          activityLevel: userRecord.nivelAtividade,
          workoutPlan: userRecord.planoTreino,
          breakfast: userRecord.cafeDaManha,
          morningSnack: userRecord.lancheDaManha,
          lunch: userRecord.almoco,
          afternoonSnack: userRecord.lancheDaTarde,
          dinner: userRecord.janta
        }
      });

      await dietRepository.save(diet);
      console.log('Created new diet with ID:', diet.id);
    }

    // If still no diet, try to get the most recent one for this user
    if (!diet) {
      console.log('No diet found, getting most recent for user');
      const dietRepository = AppDataSource.getRepository(Diet);
      diet = await dietRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' }
      });
    }

    // If still no diet, return error
    if (!diet) {
      return reply.status(404).send({
        success: false,
        error: 'No diet found. Please provide user data to create a new diet plan.'
      });
    }

    // Check if order already exists
    if (diet.membrosOrderId) {
      // If order exists, return existing order data
      const membrosApiService = new MembrosApiService();
      try {
        const existingOrder = await membrosApiService.getOrder(diet.membrosOrderId);
        return reply.send({
          success: true,
          data: {
            dietId: diet.id,
            orderId: existingOrder.id,
            qrCodeUrl: existingOrder.last_transaction?.qr_code_url,
            qrCode: existingOrder.last_transaction?.qr_code,
            status: existingOrder.status,
            amount: existingOrder.amount,
            expiresAt: existingOrder.last_transaction?.expires_at,
            message: 'Existing order found. Please complete the payment.',
            last_transaction: existingOrder.last_transaction
          }
        });
      } catch (error) {
        console.log('Error fetching existing order, creating new one:', error);
      }
    }

    // Get user data for the order
    const userDataRepository = AppDataSource.getRepository(UserData);
    const userDataRecord = await userDataRepository.findOne({
      where: { id: userId }
    });

    if (!userDataRecord) {
      return reply.status(404).send({
        success: false,
        error: 'User data not found'
      });
    }

    // Create order in membros-api with real user data
    const membrosApiService = new MembrosApiService();
    
    // Use userInfo if available from the frontend, otherwise use database record
    const phoneNumber = userInfo?.phoneNumber || userDataRecord.phoneNumber || '(11) 900000000';
    const email = userInfo?.email || userDataRecord.email;
    const cpf = userInfo?.cpf || userDataRecord.cpf;
    
    console.log('Using phone number for order:', phoneNumber);
    console.log('Parsed phone number:', parsePhoneNumber(phoneNumber));
    
    const orderData = {
      closed: true,
      customer: {
        id: userDataRecord.id,
        name: email.split('@')[0], // Use email prefix as name fallback
        type: 'individual' as const,
        email: email,
        document: cpf.replace(/\D/g, ''), // Remove dots and dashes from CPF
        phones: {
          mobile_phone: parsePhoneNumber(phoneNumber)
        },
        address: {
          street: 'Avenida Beira Rio',
          number: 0, // S/N (sem número)
          complement: 'Quadra06 Lote 10 Casa 3 Sala 1 (S/N)',
          zip_code: '75113-210',
          neighborhood: 'Andracel Center',
          city: 'Anápolis',
          state: 'GO',
          country: 'BR'
        }
      },
      items: [
        {
          code: diet.id || 'diet-plan', // Use diet.id or fallback
          amount: 990, // R$ 9,90 in cents
          description: 'Dieta Personalizada',
          quantity: 1,
          metadata: {
            customerId: userDataRecord.id,
            creatorId: userDataRecord.id // Using userId as creatorId for now
          }
        }
      ],
      totalAmount: 990
    };

    const membrosOrder = await membrosApiService.createOrder(orderData);

    console.log('Membros API Response:', JSON.stringify(membrosOrder, null, 2));

    // Update Diet record with payment info
    const dietRepository = AppDataSource.getRepository(Diet);
    diet.membrosOrderId = membrosOrder.id;
    diet.membrosOrderStatus = membrosOrder.status;
    
    // Extract PIX QR code URL from last_transaction
    if (membrosOrder.last_transaction?.qr_code_url) {
      diet.pixQrCodeUrl = membrosOrder.last_transaction.qr_code_url;
    }

    await dietRepository.save(diet);

    // Return response with QR code URL for payment
    return reply.send({
      success: true,
      data: {
        dietId: diet.id,
        orderId: membrosOrder.id,
        qrCodeUrl: membrosOrder.last_transaction?.qr_code_url,
        qrCode: membrosOrder.last_transaction?.qr_code,
        status: membrosOrder.status,
        amount: membrosOrder.amount,
        expiresAt: membrosOrder.last_transaction?.expires_at,
        message: 'Checkout created successfully. Please complete the payment to receive your diet plan.',
        last_transaction: membrosOrder.last_transaction
      }
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
};