import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { signUp, signIn, forgotPassword, resetPassword, whoami } from '../controllers/authController';
import { signUpSchema, signInSchema, authResponseSchema, errorResponseSchema } from '../types/auth';
import { authenticateBearer } from '../utils/auth';
import { z } from 'zod';

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

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/forgot-password',
    schema: {
      description: 'Request password reset',
      tags: ['Authentication'],
      body: z.object({
        email: z.string().email('Invalid email format'),
      }),
      response: {
        200: z.object({
          message: z.string(),
        }),
        400: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: forgotPassword,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/reset-password',
    schema: {
      description: 'Reset password with token',
      tags: ['Authentication'],
      body: z.object({
        token: z.string().min(1, 'Reset token is required'),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
      }),
      response: {
        200: z.object({
          message: z.string(),
        }),
        400: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: resetPassword,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/whoami',
    preHandler: authenticateBearer,
    schema: {
      description: 'Get current user information',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      response: {
        200: z.object({
          id: z.string().uuid(),
          email: z.string().email(),
          phoneNumber: z.string(),
        }),
        401: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: whoami,
  });
};