interface MembrosApiConfig {
  baseUrl: string;
  apiKey: string;
}

interface CreateOrderRequest {
  paymentMethod: 'pix' | 'credit_card';
  customer: {
    name: string;
    email: string;
    document?: string;
    document_type?: 'cpf' | 'cnpj';
    type?: 'individual' | 'company';
    phone?: {
      country_code?: string;
      area_code: string;
      number: string;
    };
  };
  items: Array<{
    description: string;
    quantity: number;
    amount: number;
    productId?: string;
    productName?: string;
  }>;
  totalAmount: number;
  projectId?: string;
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

  constructor() {
    this.config = {
      baseUrl: process.env.MEMBROS_API_URL || 'http://localhost:3001',
      apiKey: process.env.MEMBROS_API_KEY || ''
    };

    if (!this.config.apiKey) {
      throw new Error('MEMBROS_API_KEY environment variable is required');
    }
  }

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    const url = `${this.config.baseUrl}/v2/orders/pix`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-API-Key': this.config.apiKey
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Membros API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  async getOrder(orderId: string): Promise<CreateOrderResponse> {
    const url = `${this.config.baseUrl}/v2/orders/${orderId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-API-Key': this.config.apiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Membros API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }
}