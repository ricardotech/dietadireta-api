import * as argon2 from 'argon2';
import { FastifyReply, FastifyRequest } from 'fastify';

export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
};

export const verifyPassword = async (hashedPassword: string, plainPassword: string): Promise<boolean> => {
  return argon2.verify(hashedPassword, plainPassword);
};

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
};