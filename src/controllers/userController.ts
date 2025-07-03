import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { BodyMeasurements } from '../entities/BodyMeasurements';
import { UserActivity } from '../entities/UserActivity';
import {
  CreateBodyMeasurementsRequest,
  UpdateBodyMeasurementsRequest,
  CreateUserActivityRequest,
  UpdateUserActivityRequest,
  createBodyMeasurementsSchema,
  updateBodyMeasurementsSchema,
  createUserActivitySchema,
  updateUserActivitySchema,
} from '../types/user';

const userRepository = AppDataSource.getRepository(User);
const bodyMeasurementsRepository = AppDataSource.getRepository(BodyMeasurements);
const userActivityRepository = AppDataSource.getRepository(UserActivity);

export const getUserProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userId } = request.user as { userId: string };

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['bodyMeasurements', 'activity'],
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    return reply.send(userWithoutPassword);
  } catch (error) {
    console.error('Get user profile error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const createBodyMeasurements = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userId } = request.user as { userId: string };
    const validatedData = createBodyMeasurementsSchema.parse(request.body);

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['bodyMeasurements'],
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    if (user.bodyMeasurements) {
      return reply.status(400).send({ error: 'Body measurements already exist' });
    }

    const bodyMeasurements = bodyMeasurementsRepository.create({
      ...validatedData,
      user,
    });

    await bodyMeasurementsRepository.save(bodyMeasurements);

    return reply.status(201).send(bodyMeasurements);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.message,
      });
    }

    console.error('Create body measurements error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const updateBodyMeasurements = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userId } = request.user as { userId: string };
    const validatedData = updateBodyMeasurementsSchema.parse(request.body);

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['bodyMeasurements'],
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    if (!user.bodyMeasurements) {
      return reply.status(404).send({ error: 'Body measurements not found' });
    }

    await bodyMeasurementsRepository.update(user.bodyMeasurements.id, validatedData);

    const updatedBodyMeasurements = await bodyMeasurementsRepository.findOne({
      where: { id: user.bodyMeasurements.id },
    });

    return reply.send(updatedBodyMeasurements);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.message,
      });
    }

    console.error('Update body measurements error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const createUserActivity = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userId } = request.user as { userId: string };
    const validatedData = createUserActivitySchema.parse(request.body);

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['activity'],
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    if (user.activity) {
      return reply.status(400).send({ error: 'User activity already exists' });
    }

    const userActivity = userActivityRepository.create({
      ...validatedData,
      user,
    });

    await userActivityRepository.save(userActivity);

    return reply.status(201).send(userActivity);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.message,
      });
    }

    console.error('Create user activity error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

export const updateUserActivity = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userId } = request.user as { userId: string };
    const validatedData = updateUserActivitySchema.parse(request.body);

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['activity'],
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    if (!user.activity) {
      return reply.status(404).send({ error: 'User activity not found' });
    }

    await userActivityRepository.update(user.activity.id, validatedData);

    const updatedUserActivity = await userActivityRepository.findOne({
      where: { id: user.activity.id },
    });

    return reply.send(updatedUserActivity);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.message,
      });
    }

    console.error('Update user activity error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};