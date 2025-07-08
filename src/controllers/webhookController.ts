import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { Diet } from '../entities/Diet';
import { OpenAIService } from '../services/openaiService';

interface WebhookRequestBody {
  event: string;
  timestamp: string;
  order: {
    id: string;
    customer_id: string;
    amount: number;
    status: string;
    payment_method: string;
    items: Array<{
      description: string;
      quantity: number;
      amount: number;
    }>;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
  };
}

export const handleOrderPaidWebhook = async (
  request: FastifyRequest<{ Body: WebhookRequestBody }>,
  reply: FastifyReply
) => {
  try {
    const { event, order } = request.body;
    
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Event:', event);
    console.log('Full request body:', JSON.stringify(request.body, null, 2));
    console.log('Order ID:', order?.id);
    console.log('Order Status:', order?.status);
    console.log('Customer ID:', order?.customer_id);
    console.log('Payment Method:', order?.payment_method);
    console.log('Amount:', order?.amount);
    console.log('========================');

    // Check if this is a payment success event
    if (event !== 'order.paid') {
      console.log('⚠️  Event not relevant for processing:', event);
      return reply.send({
        success: true,
        message: 'Event not relevant for processing'
      });
    }
    
    console.log('✅ Processing order.paid event');

    // Extract order ID from the webhook data
    const orderId = request.body.order?.id;
    
    if (!orderId) {
      console.error('❌ Order ID not found in webhook data');
      console.error('Request body structure:', JSON.stringify(request.body, null, 2));
      return reply.status(400).send({
        success: false,
        error: 'Order ID not found in webhook data'
      });
    }
    
    console.log('🔍 Looking for diet record with membrosOrderId:', orderId);

    // Find the Diet record by membrosOrderId
    const dietRepository = AppDataSource.getRepository(Diet);
    console.log('🔎 Searching for diet with membrosOrderId:', orderId);
    
    const diet = await dietRepository.findOne({
      where: { membrosOrderId: orderId }
    });

    if (!diet) {
      console.error('❌ Diet record not found for order:', orderId);
      
      // Debug: Show all diet records to help troubleshoot
      const allDiets = await dietRepository.find({
        select: ['id', 'membrosOrderId', 'userId', 'orderStatus'],
        take: 10,
        order: { createdAt: 'DESC' }
      });
      console.log('📋 Recent diet records:', allDiets);
      
      return reply.status(404).send({
        success: false,
        error: 'Diet record not found for this order'
      });
    }
    
    console.log('✅ Diet record found:', {
      dietId: diet.id,
      userId: diet.userId,
      currentStatus: diet.membrosOrderStatus,
      hasAiResponse: !!diet.aiResponse
    });

    // Check if AI response has already been generated
    if (diet.aiResponse && diet.aiResponse.trim() !== '') {
      console.log('ℹ️  AI response already exists for order:', orderId);
      console.log('AI response length:', diet.aiResponse.length);
      return reply.send({
        success: true,
        message: 'AI response already generated for this order'
      });
    }

    // Update the order status
    console.log('🔄 Updating diet status from', diet.membrosOrderStatus, 'to paid');
    diet.membrosOrderStatus = 'paid';
    
    // Generate AI response using the stored prompt
    console.log('🤖 Starting AI response generation for order:', orderId);
    console.log('Prompt length:', diet.prompt?.length || 0);
    
    try {
      const aiResponse = await OpenAIService.generateNutritionPlan(diet.prompt);
      console.log('✅ AI response generated successfully');
      console.log('AI response length:', aiResponse.length);
      console.log('AI response preview:', aiResponse.substring(0, 200) + '...');
      
      // Save the AI response to the Diet record
      diet.aiResponse = aiResponse;
      await dietRepository.save(diet);
      
      console.log('💾 Diet record updated successfully for order:', orderId);
      console.log('Final diet record state:', {
        id: diet.id,
        userId: diet.userId,
        membrosOrderStatus: diet.membrosOrderStatus,
        hasAiResponse: !!diet.aiResponse,
        aiResponseLength: diet.aiResponse?.length || 0
      });
      
      return reply.send({
        success: true,
        message: 'AI response generated successfully'
      });
    } catch (aiError) {
      console.error('❌ Failed to generate AI response:', aiError);
      console.error('AI Error details:', {
        message: aiError.message,
        stack: aiError.stack
      });
      
      // Still update the payment status even if AI generation fails
      await dietRepository.save(diet);
      
      return reply.status(500).send({
        success: false,
        error: 'Payment confirmed but AI generation failed'
      });
    }
  } catch (error) {
    console.error('=== WEBHOOK ERROR ===');
    console.error('Error processing order paid webhook:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body that caused error:', JSON.stringify(request.body, null, 2));
    console.error('====================');
    
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
};