import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { handleOrderPaidWebhook } from '../controllers/webhookController';
import { z } from 'zod';

const webhookBodySchema = z.object({
  event: z.string(),
  timestamp: z.string(),
  order: z.object({
    id: z.string(),
    customer_id: z.string(),
    amount: z.number(),
    status: z.string(),
    payment_method: z.string(),
    items: z.array(z.object({
      description: z.string(),
      quantity: z.number(),
      amount: z.number(),
    })),
    created_at: z.string(),
    updated_at: z.string(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const webhookRoutes = async (fastify: FastifyInstance) => {
  // Main webhook endpoint that matches Membros API configuration
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/webhook',
    schema: {
      description: 'Main webhook endpoint for Membros API notifications',
      tags: ['Webhook'],
      body: webhookBodySchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string().optional(),
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
      },
    },
    handler: handleOrderPaidWebhook,
  });

  // Legacy endpoint for backwards compatibility
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/webhook/order-paid',
    schema: {
      description: 'Legacy webhook endpoint for order payment notifications',
      tags: ['Webhook'],
      body: webhookBodySchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string().optional(),
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
      },
    },
    handler: handleOrderPaidWebhook,
  });
};