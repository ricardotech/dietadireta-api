export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  portion?: string;
}

export const brazilianFoods = {
  breakfast: [
    { id: 'pao-frances', name: 'Pão Francês', category: 'carboidrato', calories: 150, portion: '1 unidade (50g)' },
    { id: 'tapioca', name: 'Tapioca', category: 'carboidrato', calories: 120, portion: '1 unidade média' },
    { id: 'cuscuz', name: 'Cuscuz', category: 'carboidrato', calories: 113, portion: '1 fatia (100g)' },
    { id: 'queijo-minas', name: 'Queijo Minas Frescal', category: 'proteina', calories: 260, portion: '100g' },
    { id: 'queijo-coalho', name: 'Queijo Coalho', category: 'proteina', calories: 350, portion: '100g' },
    { id: 'ovo-cozido', name: 'Ovo Cozido', category: 'proteina', calories: 78, portion: '1 unidade' },
    { id: 'ovo-mexido', name: 'Ovo Mexido', category: 'proteina', calories: 91, portion: '1 unidade' },
    { id: 'cafe-com-leite', name: 'Café com Leite', category: 'bebida', calories: 80, portion: '1 xícara (200ml)' },
    { id: 'suco-laranja', name: 'Suco de Laranja Natural', category: 'bebida', calories: 112, portion: '1 copo (250ml)' },
    { id: 'suco-acerola', name: 'Suco de Acerola', category: 'bebida', calories: 36, portion: '1 copo (250ml)' },
    { id: 'mamao', name: 'Mamão', category: 'fruta', calories: 43, portion: '100g' },
    { id: 'banana', name: 'Banana', category: 'fruta', calories: 89, portion: '1 unidade média' },
    { id: 'acai-tigela', name: 'Açaí na Tigela', category: 'fruta', calories: 250, portion: '200g' },
    { id: 'pao-de-queijo', name: 'Pão de Queijo', category: 'lanche', calories: 68, portion: '1 unidade (20g)' },
    { id: 'beiju', name: 'Beiju', category: 'carboidrato', calories: 100, portion: '1 unidade' },
    { id: 'bolo-fuba', name: 'Bolo de Fubá', category: 'carboidrato', calories: 180, portion: '1 fatia (60g)' },
    { id: 'vitamina-frutas', name: 'Vitamina de Frutas', category: 'bebida', calories: 150, portion: '1 copo (300ml)' },
  ],
  
  lunch: [
    { id: 'arroz-branco', name: 'Arroz Branco', category: 'carboidrato', calories: 130, portion: '100g cozido' },
    { id: 'arroz-integral', name: 'Arroz Integral', category: 'carboidrato', calories: 111, portion: '100g cozido' },
    { id: 'feijao-carioca', name: 'Feijão Carioca', category: 'proteina', calories: 76, portion: '100g cozido' },
    { id: 'feijao-preto', name: 'Feijão Preto', category: 'proteina', calories: 77, portion: '100g cozido' },
    { id: 'feijao-verde', name: 'Feijão Verde', category: 'proteina', calories: 38, portion: '100g cozido' },
    { id: 'frango-grelhado', name: 'Frango Grelhado', category: 'proteina', calories: 165, portion: '100g' },
    { id: 'frango-assado', name: 'Frango Assado', category: 'proteina', calories: 187, portion: '100g' },
    { id: 'carne-bovina-magra', name: 'Carne Bovina Magra', category: 'proteina', calories: 250, portion: '100g' },
    { id: 'carne-seca', name: 'Carne Seca', category: 'proteina', calories: 429, portion: '100g' },
    { id: 'peixe-grelhado', name: 'Peixe Grelhado', category: 'proteina', calories: 206, portion: '100g' },
    { id: 'tilapia', name: 'Tilápia Grelhada', category: 'proteina', calories: 128, portion: '100g' },
    { id: 'carne-porco', name: 'Carne de Porco Magra', category: 'proteina', calories: 242, portion: '100g' },
    { id: 'farofa', name: 'Farofa', category: 'acompanhamento', calories: 180, portion: '50g' },
    { id: 'vinagrete', name: 'Vinagrete', category: 'salada', calories: 35, portion: '100g' },
    { id: 'salada-verde', name: 'Salada Verde', category: 'salada', calories: 20, portion: '100g' },
    { id: 'couve-refogada', name: 'Couve Refogada', category: 'vegetal', calories: 40, portion: '100g' },
    { id: 'abobrinha-refogada', name: 'Abobrinha Refogada', category: 'vegetal', calories: 33, portion: '100g' },
    { id: 'quiabo', name: 'Quiabo Refogado', category: 'vegetal', calories: 37, portion: '100g' },
    { id: 'batata-doce', name: 'Batata Doce', category: 'carboidrato', calories: 86, portion: '100g cozida' },
    { id: 'mandioca', name: 'Mandioca Cozida', category: 'carboidrato', calories: 160, portion: '100g' },
    { id: 'inhame', name: 'Inhame Cozido', category: 'carboidrato', calories: 118, portion: '100g' },
    { id: 'macarrao', name: 'Macarrão', category: 'carboidrato', calories: 158, portion: '100g cozido' },
    { id: 'pirão', name: 'Pirão', category: 'acompanhamento', calories: 90, portion: '100g' },
    { id: 'moqueca', name: 'Moqueca de Peixe', category: 'prato-principal', calories: 150, portion: '200g' },
    { id: 'baiao-de-dois', name: 'Baião de Dois', category: 'prato-principal', calories: 220, portion: '200g' },
    { id: 'feijoada', name: 'Feijoada', category: 'prato-principal', calories: 350, portion: '300g' },
  ],
  
  dinner: [
    { id: 'sopa-legumes', name: 'Sopa de Legumes', category: 'sopa', calories: 89, portion: '300ml' },
    { id: 'canja-galinha', name: 'Canja de Galinha', category: 'sopa', calories: 150, portion: '300ml' },
    { id: 'omelete', name: 'Omelete', category: 'proteina', calories: 154, portion: '2 ovos' },
    { id: 'sanduiche-natural', name: 'Sanduíche Natural', category: 'lanche', calories: 250, portion: '1 unidade' },
    { id: 'torrada-integral', name: 'Torrada Integral', category: 'carboidrato', calories: 70, portion: '2 fatias' },
    { id: 'salada-completa', name: 'Salada Completa', category: 'salada', calories: 120, portion: '300g' },
    { id: 'escondidinho-frango', name: 'Escondidinho de Frango', category: 'prato-principal', calories: 280, portion: '200g' },
    { id: 'pure-batata', name: 'Purê de Batata', category: 'acompanhamento', calories: 100, portion: '100g' },
    { id: 'arroz-carreteiro', name: 'Arroz Carreteiro', category: 'prato-principal', calories: 320, portion: '200g' },
    { id: 'strogonoff-frango', name: 'Strogonoff de Frango', category: 'prato-principal', calories: 380, portion: '200g' },
  ],
  
  morningSnack: [
    { id: 'castanha-do-para', name: 'Castanha do Pará', category: 'oleaginosa', calories: 26, portion: '1 unidade' },
    { id: 'castanha-caju', name: 'Castanha de Caju', category: 'oleaginosa', calories: 10, portion: '1 unidade' },
    { id: 'amendoim', name: 'Amendoim', category: 'oleaginosa', calories: 90, portion: '20g' },
    { id: 'biscoito-polvilho', name: 'Biscoito de Polvilho', category: 'lanche', calories: 40, portion: '10g' },
    { id: 'iogurte-natural', name: 'Iogurte Natural', category: 'laticinio', calories: 61, portion: '100g' },
    { id: 'queijo-branco', name: 'Queijo Branco', category: 'proteina', calories: 240, portion: '100g' },
    { id: 'manga', name: 'Manga', category: 'fruta', calories: 60, portion: '100g' },
    { id: 'abacaxi', name: 'Abacaxi', category: 'fruta', calories: 50, portion: '100g' },
    { id: 'melancia', name: 'Melancia', category: 'fruta', calories: 30, portion: '100g' },
    { id: 'goiaba', name: 'Goiaba', category: 'fruta', calories: 68, portion: '100g' },
    { id: 'caju', name: 'Caju', category: 'fruta', calories: 43, portion: '100g' },
    { id: 'barra-cereal', name: 'Barra de Cereal', category: 'cereal', calories: 90, portion: '1 unidade (25g)' },
    { id: 'granola', name: 'Granola', category: 'cereal', calories: 95, portion: '30g' },
  ],
  
  afternoonSnack: [
    { id: 'pao-de-queijo-2', name: 'Pão de Queijo', category: 'lanche', calories: 68, portion: '1 unidade (20g)' },
    { id: 'coxinha-assada', name: 'Coxinha Assada', category: 'lanche', calories: 150, portion: '1 unidade média' },
    { id: 'empada', name: 'Empada', category: 'lanche', calories: 180, portion: '1 unidade' },
    { id: 'pastel-assado', name: 'Pastel Assado', category: 'lanche', calories: 170, portion: '1 unidade' },
    { id: 'paçoca', name: 'Paçoca', category: 'doce', calories: 114, portion: '1 unidade (30g)' },
    { id: 'pe-de-moleque', name: 'Pé de Moleque', category: 'doce', calories: 150, portion: '1 unidade (30g)' },
    { id: 'cocada', name: 'Cocada', category: 'doce', calories: 89, portion: '1 unidade (20g)' },
    { id: 'rapadura', name: 'Rapadura', category: 'doce', calories: 80, portion: '20g' },
    { id: 'vitamina-banana', name: 'Vitamina de Banana', category: 'bebida', calories: 180, portion: '1 copo (300ml)' },
    { id: 'suco-goiaba', name: 'Suco de Goiaba', category: 'bebida', calories: 120, portion: '1 copo (250ml)' },
    { id: 'agua-coco', name: 'Água de Coco', category: 'bebida', calories: 40, portion: '1 copo (200ml)' },
    { id: 'milho-cozido', name: 'Milho Cozido', category: 'carboidrato', calories: 100, portion: '1 espiga média' },
    { id: 'pipoca', name: 'Pipoca', category: 'lanche', calories: 30, portion: '1 xícara' },
  ]
};

export const breakfastBrazilianSeedData = brazilianFoods.breakfast.map(item => ({
  name: item.name,
  calories: item.calories,
  category: item.category,
  portion: item.portion
}));

export const lunchBrazilianSeedData = brazilianFoods.lunch.map(item => ({
  name: item.name,
  calories: item.calories,
  category: item.category,
  portion: item.portion
}));

export const dinnerBrazilianSeedData = brazilianFoods.dinner.map(item => ({
  name: item.name,
  calories: item.calories,
  category: item.category,
  portion: item.portion
}));

export const morningSnackBrazilianSeedData = brazilianFoods.morningSnack.map(item => ({
  name: item.name,
  calories: item.calories,
  category: item.category,
  portion: item.portion
}));

export const afternoonSnackBrazilianSeedData = brazilianFoods.afternoonSnack.map(item => ({
  name: item.name,
  calories: item.calories,
  category: item.category,
  portion: item.portion
}));