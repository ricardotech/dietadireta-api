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
    reply.status(401).send({ 
      success: false,
      error: 'Unauthorized - Invalid or missing token' 
    });
  }
};

export const authenticateBearer = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized - Bearer token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = request.server.jwt.verify(token) as { userId: string };
      request.user = { userId: decoded.userId };
    } catch (jwtError) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized - Invalid token'
      });
    }
  } catch (err) {
    return reply.status(401).send({ 
      success: false,
      error: 'Unauthorized - Authentication failed' 
    });
  }
};