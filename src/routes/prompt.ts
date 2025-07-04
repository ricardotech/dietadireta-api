import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { generatePrompt, getDiet } from '../controllers/promptController';
import { generatePromptSchema, generatePromptResponseSchema, getGeneratedPromptResponseSchema, promptErrorResponseSchema } from '../types/prompt';
import { authenticateBearer } from '../utils/auth';

export const promptRoutes = async (fastify: AppInstance) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/generatePrompt',
    preHandler: authenticateBearer,
    schema: {
      description: 'Generate a personalized nutrition prompt based on user data',
      tags: ['Nutrition'],
      security: [{ bearerAuth: [] }],
      body: generatePromptSchema,
      response: {
        200: generatePromptResponseSchema,
        401: promptErrorResponseSchema,
        404: promptErrorResponseSchema,
        500: promptErrorResponseSchema,
      },
    },
    handler: generatePrompt,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/generatePrompt',
    preHandler: authenticateBearer,
    schema: {
      description: 'Get the most recent generated nutrition prompt for the authenticated user',
      tags: ['Nutrition'],
      security: [{ bearerAuth: [] }],
      response: {
        200: getGeneratedPromptResponseSchema,
        401: promptErrorResponseSchema,
        404: promptErrorResponseSchema,
        500: promptErrorResponseSchema,
      },
    },
    handler: getDiet,
  });
};