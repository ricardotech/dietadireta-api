import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { handleOrderPaidWebhook } from '../controllers/webhookController';
import { z } from 'zod';

const webhookBodySchema = z.object({
  event: z.string(),
  created_at: z.string(),
  data: z.object({
    id: z.string(),
    code: z.string(),
    pagarme_order_id: z.string().optional(),
    paymentMethod: z.string(),
    status: z.string(),
    totalAmount: z.number(),
    legacy_items: z.array(z.object({
      amount: z.string(),
      quantity: z.number(),
      productId: z.string(),
      description: z.string(),
      productName: z.string(),
    })).optional(),
    legacy_customer: z.object({
      name: z.string(),
      type: z.string(),
      email: z.string(),
      phone: z.object({
        number: z.string(),
        area_code: z.string(),
        country_code: z.string(),
      }),
      address: z.object({
        city: z.string(),
        state: z.string(),
        number: z.string(),
        street: z.string(),
        country: z.string(),
        zip_code: z.string(),
        neighborhood: z.string(),
      }),
      document: z.string(),
      document_type: z.string(),
    }).optional(),
    legacy_payments: z.array(z.any()).optional(),
    legacy_transactions: z.array(z.any()).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
      document: z.string(),
      document_type: z.string(),
      phone_country_code: z.string(),
      phone_area_code: z.string(),
      phone_number: z.string(),
      txPercentage: z.number(),
      recipient_id: z.string(),
      email: z.string(),
      status: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }).optional(),
    customer: z.object({
      id: z.string(),
      pagarme_customer_id: z.string(),
      name: z.string(),
      email: z.string(),
      document: z.string(),
      document_type: z.string(),
      delinquent: z.boolean(),
      birthdate: z.string().optional(),
      metadata: z.record(z.any()).optional(),
      phone_country_code: z.string(),
      phone_area_code: z.string(),
      phone_number: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }).optional(),
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