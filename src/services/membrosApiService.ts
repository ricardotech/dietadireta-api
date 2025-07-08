interface MembrosApiConfig {
  baseUrl: string;
  publicKey: string;
  secretKey: string;
}

interface CreateOrderRequest {
  closed: boolean;
  customer_id: string;
  items: Array<{
    amount: number;
    description: string;
    quantity: number;
  }>;
  totalAmount: number;
}

interface CreateOrderResponse {
  id: string;
  code: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'canceled';
  paymentMethod: string;
  totalAmount: number;
  customer: {
    name: string;
    email: string;
    document: string;
    type: string;
    phone: {
      country_code: string;
      area_code: string;
      number: string;
    };
  };
  items: Array<{
    code: string;
    amount: number;
    description: string;
    quantity: number;
    metadata?: any;
  }>;
  createdAt: string;
  updatedAt: string;
  last_transaction: {
    id: string;
    transaction_type: string;
    gateway_id: string;
    amount: number;
    status: string;
    success: boolean;
    gateway_response: any;
    antifraud_response: any;
    metadata: any;
    pix_provider_tid: string;
    qr_code: string;
    qr_code_url: string;
    expires_at: string;
  };
}

export class MembrosApiService {
  private config: MembrosApiConfig;
  private projectId: string;

  constructor() {
    this.config = {
      baseUrl: process.env.MEMBROS_API_URL || 'http://localhost:3001',
      publicKey: process.env.MEMBROS_PUBLIC_KEY || '',
      secretKey: process.env.MEMBROS_SECRET_KEY || ''
    };

    this.projectId = process.env.MEMBROS_PROJECT_ID || '';

    if (!this.config.publicKey) {
      throw new Error('MEMBROS_PUBLIC_KEY environment variable is required');
    }

    if (!this.config.secretKey) {
      throw new Error('MEMBROS_SECRET_KEY environment variable is required');
    }

    if (!this.projectId) {
      throw new Error('MEMBROS_PROJECT_ID environment variable is required');
    }
  }

  // Mock data for testing
  private getMockOrderData(): CreateOrderRequest {
    return {
      "closed": true,
      "customer_id": "3f4b2a77-9e5c-4c7d-856e-2f0b8e9c0a1d",
      "items": [
        {
          "amount": 990,
          "description": "Plano Nutricional Personalizado",
          "quantity": 1
        }
      ],
      "totalAmount": 990
    };
  }

  async createOrder(orderData?: CreateOrderRequest): Promise<CreateOrderResponse> {
    // Use mock data if no order data is provided (for testing)
    const dataToSend = orderData || this.getMockOrderData();
    
    const url = `${this.config.baseUrl}/v2/orders/pix`;
    
    const authString = `${this.config.publicKey}:${this.config.secretKey}`;
    
    // Log the request for debugging
    console.log('Creating order with data:', JSON.stringify(dataToSend, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authString}`
      },
      body: JSON.stringify(dataToSend)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Membros API error response:', errorData);
      throw new Error(`Membros API error: ${response.status} - ${errorData.message || JSON.stringify(errorData) || 'Unknown error'}`);
    }

    return await response.json();
  }

  // Method specifically for testing with mock data
  async createTestOrder(): Promise<CreateOrderResponse> {
    return this.createOrder(this.getMockOrderData());
  }

  async getOrder(orderId: string): Promise<CreateOrderResponse> {
    const url = `${this.config.baseUrl}/v2/orders/${orderId}`;
    
    const authString = `${this.config.publicKey}:${this.config.secretKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authString}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Membros API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }
}