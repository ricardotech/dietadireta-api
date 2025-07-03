import 'reflect-metadata';
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { AppDataSource } from './config/database';
import { env } from './config/environment';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/user';
import { mealRoutes } from './routes/meal';
import { seedDatabase } from './seeds/seedDatabase';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

export const initializeServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    await seedDatabase();

    await fastify.register(helmet);
    await fastify.register(cors, {
      origin: env.NODE_ENV === 'production' ? false : true,
    });
    await fastify.register(jwt, {
      secret: env.JWT_SECRET,
    });
    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(userRoutes, { prefix: '/api/users' });
    await fastify.register(mealRoutes, { prefix: '/api/meals' });

    fastify.get('/health', async (request, reply) => {
      return { status: 'OK', timestamp: new Date().toISOString() };
    });

    return fastify;
  } catch (error) {
    console.error('Error initializing server:', error);
    process.exit(1);
  }
};

export default fastify;