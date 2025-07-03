import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { hashPassword, verifyPassword } from '../utils/auth';
import { SignUpRequest, SignInRequest, AuthResponse, signUpSchema, signInSchema } from '../types/auth';

const userRepository = AppDataSource.getRepository(User);

export const signUp = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const validatedData = signUpSchema.parse(request.body);
    const { email, phoneNumber, password } = validatedData;

    const existingUser = await userRepository.findOne({
      where: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return reply.status(400).send({
        error: 'User with this email or phone number already exists',
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = userRepository.create({
      email,
      phoneNumber,
      password: hashedPassword,
    });

    await userRepository.save(user);

    const token = request.server.jwt.sign({ userId: user.id });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      token,
    };

    return reply.status(201).send(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.message,
      });
    }

    console.error('Sign up error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
    });
  }
};

export const signIn = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const validatedData = signInSchema.parse(request.body);
    const { email, password } = validatedData;

    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return reply.status(401).send({
        error: 'Invalid email or password',
      });
    }

    const isPasswordValid = await verifyPassword(user.password, password);

    if (!isPasswordValid) {
      return reply.status(401).send({
        error: 'Invalid email or password',
      });
    }

    const token = request.server.jwt.sign({ userId: user.id });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      token,
    };

    return reply.status(200).send(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation error',
        details: error.message,
      });
    }

    console.error('Sign in error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
    });
  }
};