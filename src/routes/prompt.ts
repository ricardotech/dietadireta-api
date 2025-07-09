import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { FastifyInstance } from 'fastify';
import { generatePrompt, getDiet, checkPaymentStatus, createCheckout } from '../controllers/promptController';
import { generatePromptSchema, generatePromptResponseSchema, getGeneratedPromptResponseSchema, promptErrorResponseSchema } from '../types/prompt';
import { authenticateBearer } from '../utils/auth';

type AppInstance = FastifyInstance;

export const promptRoutes = async (fastify: FastifyInstance) => {
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

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/payment-status/:orderId',
    preHandler: authenticateBearer,
    schema: {
      description: 'Check payment status for an order',
      tags: ['Payment'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          orderId: { type: 'string' }
        },
        required: ['orderId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            paid: { type: 'boolean' },
            processing: { type: 'boolean' },
            status: { type: 'string' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                dietId: { type: 'string' },
                aiResponse: { type: 'string' },
                orderStatus: { type: 'string' },
                createdAt: { type: 'string' }
              }
            }
          }
        },
        401: promptErrorResponseSchema,
        404: promptErrorResponseSchema,
        500: promptErrorResponseSchema,
      },
    },
    handler: checkPaymentStatus,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/checkout',
    preHandler: authenticateBearer,
    schema: {
      description: 'Create checkout order for diet plan',
      tags: ['Payment'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          dietId: { type: 'string' }
        },
        required: ['dietId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                dietId: { type: 'string' },
                orderId: { type: 'string' },
                qrCodeUrl: { type: 'string' },
                qrCode: { type: 'string' },
                status: { type: 'string' },
                amount: { type: 'number' },
                expiresAt: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        },
        401: promptErrorResponseSchema,
        404: promptErrorResponseSchema,
        500: promptErrorResponseSchema,
      },
    },
    handler: createCheckout,
  });
};