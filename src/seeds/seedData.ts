import { BreakfastItem } from '../entities/BreakfastItem';
import { MorningSnackItem } from '../entities/MorningSnackItem';
import { LunchItem } from '../entities/LunchItem';
import { AfternoonSnackItem } from '../entities/AfternoonSnackItem';
import { DinnerItem } from '../entities/DinnerItem';

export const breakfastSeedData: Partial<BreakfastItem>[] = [
  { name: 'Tapioca + Frango' },
  { name: 'Crepioca + Queijo' },
  { name: 'Pão integral + Ovo' },
  { name: 'Aveia + Banana' },
  { name: 'Iogurte + Granola' },
  { name: 'Panqueca de Aveia' },
  { name: 'Vitamina de Frutas' },
  { name: 'Café + Biscoito Integral' },
  { name: 'Torrada + Pasta de Amendoim' },
  { name: 'Mingau de Aveia' },
];

export const morningSnackSeedData: Partial<MorningSnackItem>[] = [
  { name: 'Fruta + Castanha' },
  { name: 'Iogurte Natural' },
  { name: 'Biscoito Integral' },
  { name: 'Barrinha de Cereal' },
  { name: 'Mix de Nuts' },
  { name: 'Água de Coco' },
  { name: 'Chá Verde' },
  { name: 'Maçã + Canela' },
  { name: 'Banana + Aveia' },
  { name: 'Queijo Branco' },
];

export const lunchSeedData: Partial<LunchItem>[] = [
  { name: 'Arroz + Feijão + Frango' },
  { name: 'Salada + Peixe Grelhado' },
  { name: 'Macarrão Integral + Carne' },
  { name: 'Quinoa + Legumes' },
  { name: 'Risoto de Frango' },
  { name: 'Peixe + Batata Doce' },
  { name: 'Salada Caesar' },
  { name: 'Wrap de Frango' },
  { name: 'Sopa de Legumes' },
  { name: 'Strogonoff de Frango' },
];

export const afternoonSnackSeedData: Partial<AfternoonSnackItem>[] = [
  { name: 'Vitamina de Frutas' },
  { name: 'Sanduíche Natural' },
  { name: 'Smoothie Verde' },
  { name: 'Torrada + Abacate' },
  { name: 'Iogurte + Frutas' },
  { name: 'Biscoito + Chá' },
  { name: 'Fruta Seca' },
  { name: 'Queijo + Bolacha' },
  { name: 'Café + Bolo Fit' },
  { name: 'Suco Natural' },
];

export const dinnerSeedData: Partial<DinnerItem>[] = [
  { name: 'Sopa + Salada' },
  { name: 'Peixe + Legumes' },
  { name: 'Frango + Batata' },
  { name: 'Omelete + Salada' },
  { name: 'Carne + Arroz Integral' },
  { name: 'Salmão Grelhado' },
  { name: 'Wrap Light' },
  { name: 'Salada Completa' },
  { name: 'Sanduíche Natural' },
  { name: 'Risoto de Camarão' },
];