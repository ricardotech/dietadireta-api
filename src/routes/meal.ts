import { FastifyInstance } from 'fastify';
import { authenticate } from '../utils/auth';
import {
  getMealItems,
  createMealItem,
  updateMealItem,
  deleteMealItem,
  getUserMealSelections,
  createUserMealSelection,
  deleteUserMealSelection,
} from '../controllers/mealController';

export const mealRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/:mealType/items', getMealItems);
  
  fastify.register(async (fastify) => {
    await fastify.addHook('onRequest', authenticate);
    
    fastify.post('/:mealType/items', createMealItem);
    fastify.put('/:mealType/items/:id', updateMealItem);
    fastify.delete('/:mealType/items/:id', deleteMealItem);
    
    fastify.get('/:mealType/selections', getUserMealSelections);
    fastify.post('/:mealType/selections', createUserMealSelection);
    fastify.delete('/:mealType/selections/:id', deleteUserMealSelection);
  });
};