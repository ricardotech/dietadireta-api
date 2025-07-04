interface MembrosApiConfig {
  baseUrl: string;
  publicKey: string;
  secretKey: string;
}

interface CreateOrderRequest {
  projectId: string;
  paymentMethod: 'pix' | 'credit_card';
  customer: {
    name: string;
    email: string;
    document: string;
    document_type: 'cpf' | 'cnpj';
    type: 'individual' | 'company';
    phone: {
      country_code: string;
      area_code: string;
      number: string;
    };
    address: {
      street: string;
      number: string;
      zip_code: string;
      neighborhood: string;
      city: string;
      state: string;
      country: string;
    };
  };
  items: Array<{
    description: string;
    quantity: number;
    amount: number;
  }>;
  totalAmount: number;
}

interface CreateOrderResponse {
  id: string;
  code: string;
  status: 'pending' | 'paid' | 'failed' | 'canceled';
  totalAmount: number;
  payments: Array<{
    id: string;
    payment_method: string;
    amount: number;
    status: string;
    pix_qr_code?: string;
    pix_qr_code_url?: string;
    pix_expires_at?: string;
  }>;
  createdAt: string;
  updatedAt: string;
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

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    const url = `${this.config.baseUrl}/v2/orders/pix`;
    
    const authString = `${this.config.publicKey}:${this.config.secretKey}`;
    
    // Log the request for debugging
    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authString}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Membros API error response:', errorData);
      throw new Error(`Membros API error: ${response.status} - ${errorData.message || JSON.stringify(errorData) || 'Unknown error'}`);
    }

    return await response.json();
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