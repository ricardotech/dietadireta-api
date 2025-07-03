import { z } from 'zod';

// Response schemas for activity levels and workout plans
export const activityLevelSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const workoutPlanSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const activityLevelsResponseSchema = z.array(activityLevelSchema);
export const workoutPlansResponseSchema = z.array(workoutPlanSchema);

export const errorResponseSchema = z.object({
  error: z.string(),
});

export type ActivityLevel = z.infer<typeof activityLevelSchema>;
export type WorkoutPlan = z.infer<typeof workoutPlanSchema>;
