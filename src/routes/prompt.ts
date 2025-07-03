import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { generatePrompt } from '../controllers/promptController';
import { generatePromptSchema, generatePromptResponseSchema, promptErrorResponseSchema } from '../types/prompt';

export const promptRoutes = async (fastify: AppInstance) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/generatePrompt',
    schema: {
      description: 'Generate a personalized nutrition prompt based on user data',
      tags: ['Nutrition'],
      body: generatePromptSchema,
      response: {
        200: generatePromptResponseSchema,
        404: promptErrorResponseSchema,
        500: promptErrorResponseSchema,
      },
    },
    handler: generatePrompt,
  });
};