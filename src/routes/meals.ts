import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { 
  getAllMeals,
  getBreakfastItems, 
  getMorningSnackItems, 
  getLunchItems, 
  getAfternoonSnackItems, 
  getDinnerItems 
} from '../controllers/mealsController';
import { allMealsResponseSchema, mealItemsResponseSchema, errorResponseSchema } from '../types/meal';

export const mealsRoutes = async (fastify: AppInstance) => {
  // Combined endpoint for all meals
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/meals',
    schema: {
      description: 'Get all meal items organized by meal type',
      tags: ['Meals'],
      response: {
        200: allMealsResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: getAllMeals,
  });

  // Individual endpoints (keeping for backward compatibility)
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/breakfast',
    schema: {
      description: 'Get all breakfast items',
      tags: ['Meals'],
      response: {
        200: mealItemsResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: getBreakfastItems,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/morning-snack',
    schema: {
      description: 'Get all morning snack items',
      tags: ['Meals'],
      response: {
        200: mealItemsResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: getMorningSnackItems,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/lunch',
    schema: {
      description: 'Get all lunch items',
      tags: ['Meals'],
      response: {
        200: mealItemsResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: getLunchItems,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/afternoon-snack',
    schema: {
      description: 'Get all afternoon snack items',
      tags: ['Meals'],
      response: {
        200: mealItemsResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: getAfternoonSnackItems,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/dinner',
    schema: {
      description: 'Get all dinner items',
      tags: ['Meals'],
      response: {
        200: mealItemsResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: getDinnerItems,
  });
};
