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

    // Check which meals are activated based on user preferences
    const includeLancheManha = userData.lancheDaManha && userData.lancheDaManha.length > 0 && userData.lancheDaManha[0].trim() !== '';
    const includeLancheTarde = userData.lancheDaTarde && userData.lancheDaTarde.length > 0 && userData.lancheDaTarde[0].trim() !== '';

    // Create the prompt for OpenAI (but don't send it yet)
    const nutritionPrompt = `
Crie um plano alimentar personalizado baseado nos dados fornecidos:

DADOS DO USUÁRIO:
- Peso: ${userData.peso}kg, Altura: ${userData.altura}cm, Idade: ${userData.idade} anos
- Gênero: ${userData.genero}, Objetivo: ${userData.objetivo}
- Meta calórica: ${userData.caloriasDiarias} kcal/dia
- Nível de atividade: ${userData.nivelAtividade}
- Tipo de treino: ${userData.planoTreino}

REFEIÇÕES ATIVAS:
- Café da manhã: ATIVO
- Lanche manhã: ${includeLancheManha ? 'ATIVO' : 'INATIVO'}
- Almoço: ATIVO
- Lanche tarde: ${includeLancheTarde ? 'ATIVO' : 'INATIVO'}
- Jantar: ATIVO

PREFERÊNCIAS ALIMENTARES:
- Café da manhã: ${userData.cafeDaManha.join(', ')}
${includeLancheManha ? `- Lanche manhã: ${userData.lancheDaManha.join(', ')}` : ''}
- Almoço: ${userData.almoco.join(', ')}
${includeLancheTarde ? `- Lanche tarde: ${userData.lancheDaTarde.join(', ')}` : ''}
- Jantar: ${userData.janta.join(', ')}

INSTRUÇÕES:
1. Para cada refeição ATIVA, crie um plano "main" com 3 alimentos e um plano "alternatives" com 3 substitutos
2. Para refeições INATIVAS (lanche manhã/tarde), retorne null
3. Use as preferências alimentares fornecidas como base
4. Distribua ${userData.caloriasDiarias} calorias ao longo do dia conforme o objetivo "${userData.objetivo}"
5. Forneça quantidades específicas (ex: "150g", "1 xícara", "2 colheres")
6. Calcule calorias realistas para cada alimento
7. As alternativas devem ter valor calórico similar aos principais
8. Inclua dicas nutricionais nas notas

Retorne apenas um JSON válido com a estrutura solicitada.
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

    // Check if we already have a confirmed payment locally
    if (diet.membrosOrderStatus === 'paid') {
      // Already paid, just check if diet is ready
      if (diet.aiResponse) {
        return reply.send({
          success: true,
          paid: true,
          message: 'Diet plan ready',
          data: {
            dietId: diet.id,
            aiResponse: diet.aiResponse,
            orderStatus: 'paid',
            createdAt: diet.createdAt.toISOString()
          }
        });
      }
      // Payment confirmed but no AI response yet - this shouldn't happen but handle it
      console.warn('Payment confirmed but no AI response found for diet:', diet.id);
    }

    // Check payment status with Membros API only if not already confirmed
    let orderStatus;
    try {
      const membrosApiService = new MembrosApiService();
      orderStatus = await membrosApiService.getOrder(orderId);
      console.log('Order status from Membros API:', orderStatus);
      
      // Update local status only if it changed and is a valid payment status
      if (orderStatus.status && ['pending', 'paid', 'failed', 'canceled'].includes(orderStatus.status) && diet.membrosOrderStatus !== orderStatus.status) {
        diet.membrosOrderStatus = orderStatus.status;
        await dietRepository.save(diet);
      }
    } catch (error) {
      console.error('Error checking payment status with Membros API:', error);
      // If API fails, don't assume payment is confirmed - return current local status
      return reply.send({
        success: true,
        paid: false,
        status: diet.membrosOrderStatus || 'pending',
        message: 'Não foi possível verificar o status do pagamento. Tente novamente em alguns minutos.'
      });
    }

    // IMPORTANT: For PIX payments, order-level status "paid" is sufficient
    // Some payment gateways maintain transaction-level status as "waiting_payment" even when order is paid
    const isOrderPaid = orderStatus.status === 'paid';
    
    if (!isOrderPaid) {
      return reply.send({
        success: true,
        paid: false,
        status: orderStatus.status,
        message: orderStatus.status === 'pending' ? 'Aguardando confirmação do pagamento PIX' : 
                orderStatus.status === 'failed' ? 'Pagamento falhou. Tente novamente.' :
                orderStatus.status === 'canceled' ? 'Pagamento cancelado.' :
                'Pagamento ainda não confirmado. Tente novamente em alguns minutos.'
      });
    }

    // If payment is confirmed and diet is ready, return the diet
    if (isOrderPaid && diet.aiResponse) {
      return reply.send({
        success: true,
        paid: true,
        message: 'Diet plan ready',
        data: {
          dietId: diet.id,
          aiResponse: diet.aiResponse,
          orderStatus: orderStatus.status,
          createdAt: diet.createdAt.toISOString()
        }
      });
    }

    // If payment is confirmed but diet is not ready yet, generate it now
    if (isOrderPaid && !diet.aiResponse) {
      try {
        console.log('🤖 Generating AI diet response for manual payment verification');
        const aiResponse = await OpenAIService.generateNutritionPlan(diet.prompt);
        diet.aiResponse = aiResponse;
        await dietRepository.save(diet);
        
        console.log('✅ AI diet response generated successfully via manual verification');
        
        return reply.send({
          success: true,
          paid: true,
          message: 'Diet plan generated successfully',
          data: {
            dietId: diet.id,
            aiResponse: diet.aiResponse,
            orderStatus: orderStatus.status,
            createdAt: diet.createdAt.toISOString()
          }
        });
      } catch (aiError) {
        console.error('❌ Failed to generate AI response during manual verification:', aiError);
        return reply.send({
          success: true,
          paid: true,
          processing: true,
          message: 'Payment confirmed. Diet generation failed, please try again later.'
        });
      }
    }

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

      // Check which meals are activated based on user preferences
      const includeLancheManha = userRecord.lancheDaManha && userRecord.lancheDaManha.length > 0 && userRecord.lancheDaManha[0].trim() !== '';
      const includeLancheTarde = userRecord.lancheDaTarde && userRecord.lancheDaTarde.length > 0 && userRecord.lancheDaTarde[0].trim() !== '';

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

REFEIÇÕES ATIVAS:
- Café da manhã: ATIVO
- Lanche manhã: ${includeLancheManha ? 'ATIVO' : 'INATIVO'}
- Almoço: ATIVO
- Lanche tarde: ${includeLancheTarde ? 'ATIVO' : 'INATIVO'}
- Jantar: ATIVO

PREFERÊNCIAS ALIMENTARES:
- Café da manhã: ${userRecord.cafeDaManha.join(', ')}
${includeLancheManha ? `- Lanche da manhã: ${userRecord.lancheDaManha.join(', ')}` : ''}
- Almoço: ${userRecord.almoco.join(', ')}
${includeLancheTarde ? `- Lanche da tarde: ${userRecord.lancheDaTarde.join(', ')}` : ''}
- Jantar: ${userRecord.janta.join(', ')}

INSTRUÇÕES:
1. Para cada refeição ATIVA, crie um plano "main" com 3 alimentos e um plano "alternatives" com 3 substitutos
2. Para refeições INATIVAS (lanche manhã/tarde), retorne null
3. Distribua as calorias adequadamente entre as refeições ativas
4. Considere o objetivo (ganhar peso, perder peso, manter peso)
5. Inclua as preferências alimentares mencionadas
6. Ajuste as porções conforme o nível de atividade física
7. Forneça quantidades específicas (ex: "150g", "1 xícara", "2 colheres")
8. Calcule calorias realistas para cada alimento
9. As alternativas devem ter valor calórico similar aos principais
10. Inclua dicas nutricionais nas notas

Retorne apenas um JSON válido com a estrutura solicitada.
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
          amount: 100, // R$ 9,90 in cents
          description: 'Dieta Personalizada',
          quantity: 1,
          metadata: {
            customerId: userDataRecord.id,
            creatorId: userDataRecord.id // Using userId as creatorId for now
          }
        }
      ],
      totalAmount: 100
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

export const regenerateDiet = async (
  request: FastifyRequest<{ Body: { dietId: string; feedback: string } }>,
  reply: FastifyReply
) => {
  try {
    const { dietId, feedback } = request.body;
    const userId = request.user.userId;

    if (!dietId || !feedback) {
      return reply.status(400).send({
        success: false,
        error: 'dietId and feedback are required'
      });
    }

    // Find the original diet
    const dietRepository = AppDataSource.getRepository(Diet);
    const originalDiet = await dietRepository.findOne({
      where: { id: dietId, userId }
    });

    if (!originalDiet) {
      return reply.status(404).send({
        success: false,
        error: 'Diet not found or not authorized'
      });
    }

    // Check if regeneration limit has been reached
    if (originalDiet.regenerationCount >= 1) {
      return reply.status(400).send({
        success: false,
        error: 'You have reached the maximum number of regenerations (1) for this diet.'
      });
    }

    // Check if user has a paid diet
    if (originalDiet.membrosOrderStatus !== 'paid') {
      return reply.status(400).send({
        success: false,
        error: 'Diet regeneration is only available for paid diets'
      });
    }

    // Create an enhanced prompt with feedback
    const enhancedPrompt = `${originalDiet.prompt}

FEEDBACK DO USUÁRIO PARA MELHORIA:
${feedback}

IMPORTANTE: Considere o feedback acima e ajuste a dieta conforme solicitado, mantendo o mesmo número de calorias e estrutura, mas alterando os alimentos conforme a preferência do usuário.`;

    // Generate new AI response
    const newAiResponse = await OpenAIService.generateNutritionPlan(enhancedPrompt);

    // Create new diet record
    const newDiet = dietRepository.create({
      userId: originalDiet.userId,
      prompt: enhancedPrompt,
      aiResponse: newAiResponse,
      orderStatus: OrderStatus.COMPLETED,
      membrosOrderId: originalDiet.membrosOrderId,
      membrosOrderStatus: 'paid',
      userData: originalDiet.userData,
      isRegenerated: true,
      regenerationFeedback: feedback,
      originalDietId: originalDiet.id,
      regenerationCount: 0
    });

    await dietRepository.save(newDiet);

    // Increment regeneration count on original diet
    originalDiet.regenerationCount += 1;
    originalDiet.isRegenerated = true;
    await dietRepository.save(originalDiet);

    return reply.send({
      success: true,
      data: {
        dietId: newDiet.id,
        aiResponse: newDiet.aiResponse,
        message: 'Nova dieta gerada com sucesso baseada no seu feedback!',
        regenerationCount: originalDiet.regenerationCount
      }
    });
  } catch (error) {
    console.error('Error regenerating diet:', error);
    return reply.status(500).send({
      success: false,
      error: 'Failed to regenerate diet'
    });
  }
};

export const getUserPaidDiet = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = request.user.userId;

    // Find the most recent paid diet for this user
    const dietRepository = AppDataSource.getRepository(Diet);
    const paidDiet = await dietRepository.findOne({
      where: { 
        userId, 
        membrosOrderStatus: 'paid'
      },
      order: { createdAt: 'DESC' }
    });

    if (!paidDiet) {
      return reply.send({
        success: true,
        hasPaidDiet: false,
        message: 'No paid diet found for this user'
      });
    }

    return reply.send({
      success: true,
      hasPaidDiet: true,
      data: {
        dietId: paidDiet.id,
        aiResponse: paidDiet.aiResponse,
        createdAt: paidDiet.createdAt,
        isRegenerated: paidDiet.isRegenerated,
        originalDietId: paidDiet.originalDietId,
        regenerationCount: paidDiet.regenerationCount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user paid diet:', error);
    return reply.status(500).send({
      success: false,
      error: 'Failed to fetch user diet'
    });
  }
};