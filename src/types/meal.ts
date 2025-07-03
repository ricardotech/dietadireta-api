import { z } from 'zod';

export const createMealItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
});

export const updateMealItemSchema = createMealItemSchema.partial();

export const createUserMealSelectionSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
});

export type CreateMealItemRequest = z.infer<typeof createMealItemSchema>;
export type UpdateMealItemRequest = z.infer<typeof updateMealItemSchema>;
export type CreateUserMealSelectionRequest = z.infer<typeof createUserMealSelectionSchema>;