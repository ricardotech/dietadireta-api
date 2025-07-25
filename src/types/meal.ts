import { z } from 'zod';

export const createMealItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
});

export const updateMealItemSchema = createMealItemSchema.partial();

export const createUserMealSelectionSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
});

// Response schemas for meal items
export const mealItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const mealItemsResponseSchema = z.array(mealItemSchema);

export const allMealsResponseSchema = z.object({
  breakfast: z.array(mealItemSchema),
  morningSnack: z.array(mealItemSchema),
  lunch: z.array(mealItemSchema),
  afternoonSnack: z.array(mealItemSchema),
  dinner: z.array(mealItemSchema),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

export type CreateMealItemRequest = z.infer<typeof createMealItemSchema>;
export type UpdateMealItemRequest = z.infer<typeof updateMealItemSchema>;
export type CreateUserMealSelectionRequest = z.infer<typeof createUserMealSelectionSchema>;
export type MealItem = z.infer<typeof mealItemSchema>;
export type AllMealsResponse = z.infer<typeof allMealsResponseSchema>;