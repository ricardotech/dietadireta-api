import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIService {
  static async generateNutritionPlan(prompt: string): Promise<string> {
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key is not configured');
        }

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Você é um nutricionista especialista e experiente, especializado em culinária brasileira. 
              
              IMPORTANTE: Use EXCLUSIVAMENTE alimentos típicos brasileiros em todas as refeições.
              
              Responda **apenas** com um objeto JSON que siga exatamente este schema:

              {
                "breakfast": {
                  "main": [
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number}
                  ],
                  "alternatives": [
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number}
                  ]
                },
                "morningSnack": null OR {
                  "main": [
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number}
                  ],
                  "alternatives": [
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number}
                  ]
                },
                "lunch": {
                  "main": [
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number}
                  ],
                  "alternatives": [
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number}
                  ]
                },
                "afternoonSnack": null OR {
                  "main": [
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number}
                  ],
                  "alternatives": [
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number}
                  ]
                },
                "dinner": {
                  "main": [
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number}
                  ],
                  "alternatives": [
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number},
                    {"name": "string", "quantity": "string", "calories": number}
                  ]
                },
                "totalCalories": number,
                "notes": "string com dicas nutricionais personalizadas"
              }

              IMPORTANTE:
              - Para cada refeição ativa: forneça um plano "main" com 3 itens e um plano "alternatives" com 3 itens substitutos
              - Se morningSnack ou afternoonSnack não foram ativados pelo usuário, retorne null para esses campos
              - Base-se nas preferências alimentares fornecidas
              - Distribua as calorias conforme o objetivo do usuário
              - Forneça quantidades específicas (ex: "150g", "1 xícara", "2 colheres")
              - Calcule calorias realistas para cada item
              - As alternativas devem ter valor calórico similar aos itens principais
              - Responda sempre em português brasileiro`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.1,
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
          throw new Error('Empty response from OpenAI');
        }

        // Validate that the response is valid JSON with required structure
        try {
          const parsed = JSON.parse(response);
          if (!parsed.breakfast?.main || !parsed.lunch?.main || !parsed.dinner?.main) {
            throw new Error('Invalid JSON structure - missing required meal main arrays');
          }
          console.log('✅ Valid JSON response generated on attempt', attempt + 1);
          return response;
        } catch (jsonError) {
          console.log(`❌ Invalid JSON on attempt ${attempt + 1}:`, jsonError);
          if (attempt === maxRetries - 1) {
            throw jsonError;
          }
          continue;
        }
      } catch (error) {
        console.error(`Erro na tentativa ${attempt + 1} de gerar plano nutricional:`, error);
        lastError = error;
        if (attempt === maxRetries - 1) {
          break;
        }
      }
    }

    console.error('Todas as tentativas falharam, retornando erro');
    throw new Error(`Falha ao gerar plano nutricional após ${maxRetries} tentativas: ${lastError?.message}`);
  }
}
