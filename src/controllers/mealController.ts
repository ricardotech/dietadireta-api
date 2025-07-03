import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { BreakfastItem } from '../entities/BreakfastItem';
import { MorningSnackItem } from '../entities/MorningSnackItem';
import { LunchItem } from '../entities/LunchItem';
import { AfternoonSnackItem } from '../entities/AfternoonSnackItem';
import { DinnerItem } from '../entities/DinnerItem';
import { UserBreakfast } from '../entities/UserBreakfast';
import { UserMorningSnack } from '../entities/UserMorningSnack';
import { UserLunch } from '../entities/UserLunch';
import { UserAfternoonSnack } from '../entities/UserAfternoonSnack';
import { UserDinner } from '../entities/UserDinner';
import {
  CreateMealItemRequest,
  UpdateMealItemRequest,
  CreateUserMealSelectionRequest,
  createMealItemSchema,
  updateMealItemSchema,
  createUserMealSelectionSchema,
} from '../types/meal';

const userRepository = AppDataSource.getRepository(User);
const breakfastItemRepository = AppDataSource.getRepository(BreakfastItem);
const morningSnackItemRepository = AppDataSource.getRepository(MorningSnackItem);
const lunchItemRepository = AppDataSource.getRepository(LunchItem);
const afternoonSnackItemRepository = AppDataSource.getRepository(AfternoonSnackItem);
const dinnerItemRepository = AppDataSource.getRepository(DinnerItem);
const userBreakfastRepository = AppDataSource.getRepository(UserBreakfast);
const userMorningSnackRepository = AppDataSource.getRepository(UserMorningSnack);
const userLunchRepository = AppDataSource.getRepository(UserLunch);
const userAfternoonSnackRepository = AppDataSource.getRepository(UserAfternoonSnack);
const userDinnerRepository = AppDataSource.getRepository(UserDinner);

interface MealTypeParams {
  mealType: 'breakfast' | 'morning-snack' | 'lunch' | 'afternoon-snack' | 'dinner';
}

interface MealItemParams extends MealTypeParams {
  id: string;
}

const getMealRepository = (mealType: string) => {
  switch (mealType) {
    case 'breakfast':
      return breakfastItemRepository;
    case 'morning-snack':
      return morningSnackItemRepository;
    case 'lunch':
      return lunchItemRepository;
    case 'afternoon-snack':
      return afternoonSnackItemRepository;
    case 'dinner':
      return dinnerItemRepository;
    default:
      throw new Error('Invalid meal type');
  }
};

const getUserMealRepository = (mealType: string) => {
  switch (mealType) {
    case 'breakfast':
      return userBreakfastRepository;
    case 'morning-snack':
      return userMorningSnackRepository;
    case 'lunch':
      return userLunchRepository;
    case 'afternoon-snack':
      return userAfternoonSnackRepository;
    case 'dinner':
      return userDinnerRepository;
    default:
      throw new Error('Invalid meal type');
  }
};

export const getMealItems = async (request: FastifyRequest<{ Params: MealTypeParams }>, reply: FastifyReply) => {
  try {
    const { mealType } = request.params;
    const repository = getMealRepository(mealType);
    const items = await repository.find({ order: { name: 'ASC' } });
    return reply.send(items);
  } catch (error) {
    console.error('Get meal items error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const createMealItem = async (request: FastifyRequest<{ Params: MealTypeParams }>, reply: FastifyReply) => {
  try {
    const { mealType } = request.params;
    const validatedData = createMealItemSchema.parse(request.body);
    const repository = getMealRepository(mealType);

    const item = repository.create(validatedData);
    await repository.save(item);

    return reply.status(201).send(item);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.message,
      });
    }

    console.error('Create meal item error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const updateMealItem = async (request: FastifyRequest<{ Params: MealItemParams }>, reply: FastifyReply) => {
  try {
    const { mealType, id } = request.params;
    const validatedData = updateMealItemSchema.parse(request.body);
    const repository = getMealRepository(mealType);

    const item = await repository.findOne({ where: { id } });
    if (!item) {
      return reply.status(404).send({ error: 'Meal item not found' });
    }

    await repository.update(id, validatedData);
    const updatedItem = await repository.findOne({ where: { id } });

    return reply.send(updatedItem);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.message,
      });
    }

    console.error('Update meal item error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const deleteMealItem = async (request: FastifyRequest<{ Params: MealItemParams }>, reply: FastifyReply) => {
  try {
    const { mealType, id } = request.params;
    const repository = getMealRepository(mealType);

    const item = await repository.findOne({ where: { id } });
    if (!item) {
      return reply.status(404).send({ error: 'Meal item not found' });
    }

    await repository.delete(id);
    return reply.status(204).send();
  } catch (error) {
    console.error('Delete meal item error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const getUserMealSelections = async (request: FastifyRequest<{ Params: MealTypeParams }>, reply: FastifyReply) => {
  try {
    const { userId } = request.user as { userId: string };
    const { mealType } = request.params;
    const repository = getUserMealRepository(mealType);

    const selections = await repository.find({
      where: { user: { id: userId } },
      relations: ['item'],
      order: { createdAt: 'DESC' },
    });

    return reply.send(selections);
  } catch (error) {
    console.error('Get user meal selections error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const createUserMealSelection = async (request: FastifyRequest<{ Params: MealTypeParams }>, reply: FastifyReply) => {
  try {
    const { userId } = request.user as { userId: string };
    const { mealType } = request.params;
    const validatedData = createUserMealSelectionSchema.parse(request.body);
    const { itemId } = validatedData;

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const mealRepository = getMealRepository(mealType);
    const item = await mealRepository.findOne({ where: { id: itemId } });
    if (!item) {
      return reply.status(404).send({ error: 'Meal item not found' });
    }

    const userMealRepository = getUserMealRepository(mealType);
    const selection = userMealRepository.create({
      user,
      item,
    });

    await userMealRepository.save(selection);

    return reply.status(201).send(selection);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.message,
      });
    }

    console.error('Create user meal selection error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const deleteUserMealSelection = async (request: FastifyRequest<{ Params: { mealType: string; id: string } }>, reply: FastifyReply) => {
  try {
    const { userId } = request.user as { userId: string };
    const { mealType, id } = request.params;
    const repository = getUserMealRepository(mealType);

    const selection = await repository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!selection) {
      return reply.status(404).send({ error: 'Meal selection not found' });
    }

    await repository.delete(id);
    return reply.status(204).send();
  } catch (error) {
    console.error('Delete user meal selection error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};