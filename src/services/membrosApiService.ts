interface MembrosApiConfig {
  baseUrl: string;
  publicKey: string;
  secretKey: string;
}

interface CreateOrderRequest {
  closed: boolean;
  customer: {
    id?: string;
    name: string;
    type: 'individual' | 'company';
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
    metadata: {
      customerId: string;
      creatorId: string;
    };
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