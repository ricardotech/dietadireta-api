import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { handleOrderPaidWebhook } from '../controllers/webhookController';
import { z } from 'zod';

const webhookBodySchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.string(),
    status: z.string(),
    orderId: z.string().optional(),
    order: z.object({
      id: z.string(),
      status: z.string(),
    }).optional(),
  }),
});

export const webhookRoutes = async (fastify: FastifyInstance) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/webhook/order-paid',
    schema: {
      description: 'Webhook endpoint for order payment notifications',
      tags: ['Webhook'],
      body: webhookBodySchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
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