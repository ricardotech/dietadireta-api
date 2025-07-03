import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIService {
  static async generateNutritionPlan(prompt: string): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um nutricionista especialista e experiente. Você deve criar planos nutricionais detalhados, personalizados e baseados em evidências científicas. Responda sempre em português brasileiro de forma clara, objetiva e profissional."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Não foi possível gerar o plano nutricional.';
    } catch (error) {
      console.error('Erro ao gerar plano nutricional com OpenAI:', error);
      throw new Error('Falha ao gerar plano nutricional');
    }
  }
}
