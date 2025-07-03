import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getActivityLevels, getWorkoutPlans } from '../controllers/activitiesController';
import { activityLevelsResponseSchema, workoutPlansResponseSchema, errorResponseSchema } from '../types/activities';

export const activitiesRoutes = async (fastify: AppInstance) => {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/activity-levels',
    schema: {
      description: 'Get all activity levels',
      tags: ['Activities'],
      response: {
        200: activityLevelsResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: getActivityLevels,
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/workout-plans',
    schema: {
      description: 'Get all workout plan types',
      tags: ['Activities'],
      response: {
        200: workoutPlansResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: getWorkoutPlans,
  });
};
