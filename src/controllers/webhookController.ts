import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { Diet } from '../entities/Diet';
import { OpenAIService } from '../services/openaiService';

interface WebhookRequestBody {
  event: string;
  data: {
    id: string;
    status: string;
    orderId?: string;
    order?: {
      id: string;
      status: string;
    };
  };
}

export const handleOrderPaidWebhook = async (
  request: FastifyRequest<{ Body: WebhookRequestBody }>,
  reply: FastifyReply
) => {
  try {
    const { event, data } = request.body;

    // Check if this is a payment success event
    if (event !== 'payment.paid' && event !== 'order.paid') {
      return reply.send({
        success: true,
        message: 'Event not relevant for processing'
      });
    }

    // Extract order ID from the webhook data
    const orderId = data.orderId || data.order?.id || data.id;
    
    if (!orderId) {
      return reply.status(400).send({
        success: false,
        error: 'Order ID not found in webhook data'
      });
    }

    // Find the Diet record by membrosOrderId
    const dietRepository = AppDataSource.getRepository(Diet);
    const diet = await dietRepository.findOne({
      where: { membrosOrderId: orderId }
    });

    if (!diet) {
      return reply.status(404).send({
        success: false,
        error: 'Diet record not found for this order'
      });
    }

    // Check if AI response has already been generated
    if (diet.aiResponse && diet.aiResponse.trim() !== '') {
      return reply.send({
        success: true,
        message: 'AI response already generated for this order'
      });
    }

    // Update the order status
    diet.membrosOrderStatus = 'paid';
    
    // Generate AI response using the stored prompt
    console.log('Generating AI response for paid order:', orderId);
    const aiResponse = await OpenAIService.generateNutritionPlan(diet.prompt);
    
    // Save the AI response to the Diet record
    diet.aiResponse = aiResponse;
    await dietRepository.save(diet);

    console.log('AI response generated and saved for order:', orderId);

    return reply.send({
      success: true,
      message: 'AI response generated successfully'
    });
  } catch (error) {
    console.error('Error processing order paid webhook:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
};