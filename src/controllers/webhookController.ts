import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { Diet } from '../entities/Diet';
import { OpenAIService } from '../services/openaiService';

interface WebhookRequestBody {
  event: string;
  created_at: string;
  data: {
    id: string;
    code: string;
    pagarme_order_id?: string;
    paymentMethod: string;
    status: string;
    totalAmount: number;
    legacy_items?: Array<{
      amount: string;
      quantity: number;
      productId: string;
      description: string;
      productName: string;
    }>;
    legacy_customer?: {
      name: string;
      type: string;
      email: string;
      phone: {
        number: string;
        area_code: string;
        country_code: string;
      };
      address: {
        city: string;
        state: string;
        number: string;
        street: string;
        country: string;
        zip_code: string;
        neighborhood: string;
      };
      document: string;
      document_type: string;
    };
    legacy_payments?: Array<any>;
    legacy_transactions?: Array<any>;
    createdAt: string;
    updatedAt: string;
    user?: {
      id: string;
      name: string;
      avatar: string | null;
      document: string;
      document_type: string;
      phone_country_code: string;
      phone_area_code: string;
      phone_number: string;
      txPercentage: number;
      recipient_id: string;
      email: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
    customer?: {
      id: string;
      pagarme_customer_id: string;
      name: string;
      email: string;
      document: string;
      document_type: string;
      delinquent: boolean;
      birthdate?: string;
      metadata?: Record<string, any>;
      phone_country_code: string;
      phone_area_code: string;
      phone_number: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export const handleOrderPaidWebhook = async (
  request: FastifyRequest<{ Body: WebhookRequestBody }>,
  reply: FastifyReply
) => {
  try {
    const { event, data } = request.body;
    
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Event:', event);
    console.log('Full request body:', JSON.stringify(request.body, null, 2));
    console.log('Order ID:', data?.id);
    console.log('Order Status:', data?.status);
    console.log('Payment Method:', data?.paymentMethod);
    console.log('Amount:', data?.totalAmount);
    console.log('========================');

    // Check if this is a payment success event
    if (event !== 'order.paid') {
      console.log('⚠️  Event not relevant for processing:', event);
      // Still process other events that might indicate payment success
      if (event === 'order.updated' && data?.status === 'paid') {
        console.log('✅ Processing order.updated event with paid status');
      } else {
        return reply.send({
          success: true,
          message: 'Event not relevant for processing'
        });
      }
    } else {
      console.log('✅ Processing order.paid event');
    }

    // Extract order ID from the webhook data
    const orderId = request.body.data?.id;
    
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

    // Check if the order status is actually 'paid'
    if (data?.status !== 'paid') {
      console.log('⚠️  Order status is not paid:', data?.status);
      return reply.send({
        success: true,
        message: 'Order status is not paid yet'
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
        message: aiError instanceof Error ? aiError.message : 'Unknown error',
        stack: aiError instanceof Error ? aiError.stack : undefined
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
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : undefined);
    console.error('Request body that caused error:', JSON.stringify(request.body, null, 2));
    console.error('====================');
    
    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
};