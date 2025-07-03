import { FastifyInstance } from 'fastify';
import { signUp, signIn } from '../controllers/authController';

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/signup', signUp);
  fastify.post('/signin', signIn);
};