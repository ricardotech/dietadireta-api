import { FastifyInstance } from 'fastify';
import { authenticate } from '../utils/auth';
import {
  getUserProfile,
  createBodyMeasurements,
  updateBodyMeasurements,
  createUserActivity,
  updateUserActivity,
} from '../controllers/userController';

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/profile', getUserProfile);
  fastify.post('/body-measurements', createBodyMeasurements);
  fastify.put('/body-measurements', updateBodyMeasurements);
  fastify.post('/activity', createUserActivity);
  fastify.put('/activity', updateUserActivity);
};