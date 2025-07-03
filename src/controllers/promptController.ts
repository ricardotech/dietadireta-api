import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { UserData } from '../entities/UserData';
import { 
  Objetivo, 
  CaloriasDiarias, 
  HorariosRefeicoesOption, 
  Genero, 
  NivelAtividade, 
  TipoPlanoTreino 
} from '../types/enums';

interface GeneratePromptRequest {
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
  request: FastifyRequest<{ Body: GeneratePromptRequest }>,
  reply: FastifyReply
) => {
  try {
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
    } = request.body;

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

    // Update user data with new information
    userData.peso = parseFloat(weight);
    userData.altura = parseFloat(height);
    userData.idade = parseInt(age);
    userData.objetivo = goal as unknown as Objetivo;
    userData.caloriasDiarias = calories as unknown as CaloriasDiarias;
    userData.genero = gender as unknown as Genero;
    userData.horariosParaRefeicoes = schedule as unknown as HorariosRefeicoesOption;
    userData.nivelAtividade = activityLevel as unknown as NivelAtividade;
    userData.planoTreino = workoutPlan as unknown as TipoPlanoTreino;
    userData.cafeDaManha = breakfast.split(',').map((item: string) => item.trim());
    userData.lancheDaManha = morningSnack.split(',').map((item: string) => item.trim());
    userData.almoco = lunch.split(',').map((item: string) => item.trim());
    userData.lancheDaTarde = afternoonSnack.split(',').map((item: string) => item.trim());
    userData.janta = dinner.split(',').map((item: string) => item.trim());

    // Save updated user data
    await userDataRepository.save(userData);

    const prompt = `
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

    return reply.send({
      success: true,
      prompt,
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