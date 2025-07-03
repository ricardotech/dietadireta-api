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
  token: string;
  Peso: string;
  Altura: string;
  Idade: string;
  Objetivo: string;
  Calorias: string;
  Genero: string;
  Horarios: string;
  nivelAtividade: string;
  treino: string;
  cafeDaManha: string;
  lancheDaManha: string;
  almoco: string;
  lancheDaTarde: string;
  janta: string;
}

export const generatePrompt = async (
  request: FastifyRequest<{ Body: GeneratePromptRequest }>,
  reply: FastifyReply
) => {
  try {
    const {
      token,
      Peso,
      Altura,
      Idade,
      Objetivo,
      Calorias,
      Genero,
      Horarios,
      nivelAtividade,
      treino,
      cafeDaManha,
      lancheDaManha,
      almoco,
      lancheDaTarde,
      janta
    } = request.body;

    // Find user by token
    const userDataRepository = AppDataSource.getRepository(UserData);
    let userData = await userDataRepository.findOne({ where: { token } });

    if (!userData) {
      return reply.status(404).send({
        success: false,
        error: 'User not found with provided token'
      });
    }

    // Update user data with new information
    userData.peso = parseFloat(Peso);
    userData.altura = parseFloat(Altura);
    userData.idade = parseInt(Idade);
    userData.objetivo = Objetivo as Objetivo;
    userData.caloriasDiarias = Calorias as CaloriasDiarias;
    userData.genero = Genero as Genero;
    userData.horariosParaRefeicoes = Horarios as HorariosRefeicoesOption;
    userData.nivelAtividade = nivelAtividade as NivelAtividade;
    userData.planoTreino = treino as TipoPlanoTreino;
    userData.cafeDaManha = cafeDaManha.split(',').map(item => item.trim());
    userData.lancheDaManha = lancheDaManha.split(',').map(item => item.trim());
    userData.almoco = almoco.split(',').map(item => item.trim());
    userData.lancheDaTarde = lancheDaTarde.split(',').map(item => item.trim());
    userData.janta = janta.split(',').map(item => item.trim());

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
        peso: userData.peso,
        altura: userData.altura,
        idade: userData.idade,
        objetivo: userData.objetivo,
        caloriasDiarias: userData.caloriasDiarias,
        genero: userData.genero,
        horariosParaRefeicoes: userData.horariosParaRefeicoes,
        nivelAtividade: userData.nivelAtividade,
        planoTreino: userData.planoTreino,
        cafeDaManha: userData.cafeDaManha,
        lancheDaManha: userData.lancheDaManha,
        almoco: userData.almoco,
        lancheDaTarde: userData.lancheDaTarde,
        janta: userData.janta
      }
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
};