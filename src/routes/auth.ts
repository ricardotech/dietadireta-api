import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { signUp, signIn } from '../controllers/authController';
import { signUpSchema, signInSchema, authResponseSchema, errorResponseSchema } from '../types/auth';

export const authRoutes = async (fastify: AppInstance) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/signup',
    schema: {
      description: 'Create a new user account',
      tags: ['Authentication'],
      body: signUpSchema,
      response: {
        201: authResponseSchema,
        400: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: signUp,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/signin',
    schema: {
      description: 'Sign in to an existing account',
      tags: ['Authentication'],
      body: signInSchema,
      response: {
        200: authResponseSchema,
        401: errorResponseSchema,
        400: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: signIn,
  });
};