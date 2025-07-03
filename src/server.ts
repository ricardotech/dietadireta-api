import 'reflect-metadata';
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';
import { z } from 'zod';
import { AppDataSource } from './config/database';
import { env } from './config/environment';
import { authRoutes } from './routes/auth';
import { promptRoutes } from './routes/prompt';
import { mealsRoutes } from './routes/meals';
import { activitiesRoutes } from './routes/activities';
import { seedDatabase } from './seeds/seedDatabase';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
}).withTypeProvider<ZodTypeProvider>();

// Add schema validator and serializer
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

export const initializeServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    await seedDatabase();

    // Register Swagger
    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Nutri Online API',
          description: 'Nutrition API with TypeORM, Fastify, and PostgreSQL',
          version: '1.0.0',
        },
        servers: [
          {
            url: env.NODE_ENV === 'production' ? 'https://api.nutri-online.com' : 'http://localhost:3000',
            description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      transform: jsonSchemaTransform,
    });

    await fastify.register(fastifySwaggerUI, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
      },
      uiHooks: {
        onRequest: function (request, reply, next) {
          next();
        },
        preHandler: function (request, reply, next) {
          next();
        },
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => {
        return swaggerObject;
      },
      transformSpecificationClone: true,
    });

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
    await fastify.register(promptRoutes, { prefix: '/api' });
    await fastify.register(mealsRoutes, { prefix: '/api/meals' });
    await fastify.register(activitiesRoutes, { prefix: '/api/activities' });

    fastify.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/health',
      schema: {
        description: 'Health check endpoint',
        tags: ['Health'],
        response: {
          200: z.object({
            status: z.literal('OK'),
            timestamp: z.string(),
          }),
        },
      },
      handler: async (request, reply) => {
        return { status: 'OK' as const, timestamp: new Date().toISOString() };
      },
    });

    return fastify;
  } catch (error) {
    console.error('Error initializing server:', error);
    process.exit(1);
  }
};

export default fastify;