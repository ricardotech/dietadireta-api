import { FastifyRequest, FastifyReply } from 'fastify';
import { NivelAtividade, TipoPlanoTreino } from '../types/enums';

export const getActivityLevels = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const activityLevels = Object.values(NivelAtividade).map(level => ({
      value: level,
      label: level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')
    }));
    
    return reply.status(200).send(activityLevels);
  } catch (error) {
    console.error('Erro ao buscar níveis de atividade:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};

export const getWorkoutPlans = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const workoutPlans = Object.values(TipoPlanoTreino).map(plan => ({
      value: plan,
      label: plan.charAt(0).toUpperCase() + plan.slice(1)
    }));
    
    return reply.status(200).send(workoutPlans);
  } catch (error) {
    console.error('Erro ao buscar planos de treino:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};
