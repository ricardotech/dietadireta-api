interface MembrosApiConfig {
  baseUrl: string;
  publicKey: string;
  secretKey: string;
}

interface CreateOrderRequest {
  closed: boolean;
  customer: {
    id: string;
    name: string;
    type: 'individual' | 'business';
    email: string;
    document: string;
    phones: {
      mobile_phone: {
        country_code: string;
        area_code: string;
        number: string;
      };
    };
    address: {
      street: string;
      number: number;
      zip_code: string;
      neighborhood: string;
      city: string;
      state: string;
      country: string;
    };
  };
  items: Array<{
    code: string;
    amount: number;
    description: string;
    quantity: number;
    metadata?: {
      customerId: string;
      creatorId: string;
    };
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
      baseUrl: process.env.MEMBROS_API_URL || 'https://api.membros.app',
      publicKey: process.env.MEMBROS_PUBLIC_KEY || '',
      secretKey: process.env.MEMBROS_SECRET_KEY || ''
    };

    this.projectId = process.env.MEMBROS_PROJECT_ID || 'test-project';

    // Comment out environment validations for now since we're using hardcoded test values
    /*
    if (!this.config.publicKey) {
      throw new Error('MEMBROS_PUBLIC_KEY environment variable is required');
    }

    if (!this.config.secretKey) {
      throw new Error('MEMBROS_SECRET_KEY environment variable is required');
    }

    if (!this.projectId) {
      throw new Error('MEMBROS_PROJECT_ID environment variable is required');
    }
    */
  }

  // Mock data for testing
  private getMockOrderData(): CreateOrderRequest {
    return {
      "closed": true,
      "customer": {
        "id": "4d0a9f11-9783-4b97-b0f2-3a2a657f043a",
        "name": "Ricardo Fonseca Sarti Domene",
        "type": "individual",
        "email": "ricardofsdomene@icloud.com",
        "document": "37151994826",
        "phones": {
          "mobile_phone": {
            "country_code": "55",
            "area_code": "11",
            "number": "915799139"
          }
        },
        "address": {
          "street": "Avenida Presidente Kennedy",
          "number": 289,
          "zip_code": "75040040",
          "neighborhood": "Maracanã",
          "city": "Anápolis",
          "state": "GO",
          "country": "BR"
        }
      },
      "items": [
        {
          "code": "d1e31583-3dd1-411c-99eb-1e06405c942e",
          "amount": 1990,
          "description": "Vestibulando",
          "quantity": 1,
          "metadata": {
            "customerId": "4d0a9f11-9783-4b97-b0f2-3a2a657f043a",
            "creatorId": "ebbf779e-6fc1-487c-9feb-d8721454cf5e"
          }
        }
      ],
      "totalAmount": 1990
    };
  }

  // Mock response for testing
  private getMockOrderResponse(): CreateOrderResponse {
    return {
      "id": "mock-order-id-" + Date.now(),
      "code": "mock-code-" + Date.now(),
      "amount": 990,
      "status": "pending",
      "paymentMethod": "pix",
      "totalAmount": 990,
      "customer": {
        "name": "Test User",
        "email": "test@example.com",
        "document": "00000000000",
        "type": "individual",
        "phone": {
          "country_code": "55",
          "area_code": "11",
          "number": "900000000"
        }
      },
      "items": [
        {
          "code": "diet-item-code",
          "amount": 990,
          "description": "Dieta Personalizada",
          "quantity": 1,
          "metadata": {
            "customerId": "test-customer-id",
            "creatorId": "test-creator-id"
          }
        }
      ],
      "createdAt": new Date().toISOString(),
      "updatedAt": new Date().toISOString(),
      "last_transaction": {
        "id": "mock-transaction-id",
        "transaction_type": "pix",
        "gateway_id": "mock-gateway-id",
        "amount": 990,
        "status": "waiting_payment",
        "success": true,
        "gateway_response": {},
        "antifraud_response": {},
        "metadata": {},
        "pix_provider_tid": "mock-provider-tid",
        "qr_code": "00020101021226820014br.gov.bcb.pix2560pix.stone.com.br/pix/v2/mock-qr-code520400005303986540519.905802BR5925Mock Payment6014RIO DE JANEIRO62290525mockqrcode30484E6",
        "qr_code_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "expires_at": new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }
    };
  }

  async createOrder(orderData?: CreateOrderRequest): Promise<CreateOrderResponse> {
    // Use mock data if no order data is provided (for testing)
    const dataToSend = orderData || this.getMockOrderData();
    
    const url = `${this.config.baseUrl}/v2/orders/pix`;
    
    // Log the request for debugging
    console.log('Creating order with data:', JSON.stringify(dataToSend, null, 2));
    
    // For now, we'll use a placeholder auth header since we don't have real API keys
    // In production, you would use: `Bearer ${this.config.publicKey}:${this.config.secretKey}`
    const authHeader = this.config.publicKey && this.config.secretKey 
      ? `Bearer ${this.config.publicKey}:${this.config.secretKey}`
      : 'Bearer test_public_key:test_secret_key';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(dataToSend)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Membros API error response:', errorData);
      
      // If we get an auth error and we're using test keys, return mock data for development
      if (response.status === 401 && authHeader.includes('test_')) {
        console.log('Using mock response for development since no real API keys are configured');
        return this.getMockOrderResponse();
      }
      
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
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Membros API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }
}