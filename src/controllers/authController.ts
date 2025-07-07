import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { UserData } from '../entities/UserData';
import { hashPassword, verifyPassword } from '../utils/auth';
import { SignUpRequest, SignInRequest, AuthResponse, signUpSchema, signInSchema } from '../types/auth';
import { emailService } from '../services/emailService';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { 
  Objetivo, 
  HorariosRefeicoesOption, 
  Genero, 
  NivelAtividade, 
  TipoPlanoTreino 
} from '../types/enums';

const userRepository = AppDataSource.getRepository(UserData);

export const signUp = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const validatedData = signUpSchema.parse(request.body);
    const { email, phoneNumber, password } = validatedData;

    // Check for existing email
    const existingUser = await userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      return reply.status(400).send({
        error: 'Usuário com este email já existe',
      });
    }

    // Check for existing phone number only if provided
    if (phoneNumber) {
      const existingPhone = await userRepository.findOne({
        where: { phoneNumber },
      });

      if (existingPhone) {
        return reply.status(400).send({
          error: 'Usuário com este número de telefone já existe',
        });
      }
    }

    const hashedPassword = await hashPassword(password);

    const userToken = uuidv4();
    
    const user = userRepository.create({
      email,
      phoneNumber,
      password: hashedPassword,
      token: userToken,
      // Set default values for required fields
      peso: 0,
      altura: 0,
      idade: 0,
      objetivo: Objetivo.EMAGRECER,
      caloriasDiarias: 2000,
      horariosParaRefeicoes: HorariosRefeicoesOption.H0700,
      genero: Genero.MASCULINO,
      nivelAtividade: NivelAtividade.MODERADO,
      planoTreino: TipoPlanoTreino.ACADEMIA,
      cafeDaManha: [],
      lancheDaManha: [],
      almoco: [],
      lancheDaTarde: [],
      janta: [],
    });

    await userRepository.save(user);

    const jwtToken = request.server.jwt.sign({ userId: user.id });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber || undefined,
      },
      token: jwtToken,
      userToken: userToken,
    };

    return reply.status(201).send(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Erro de validação',
        details: error.message,
      });
    }

    console.error('Erro no cadastro:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
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
        error: 'Email ou senha inválidos',
      });
    }

    const isPasswordValid = await verifyPassword(user.password, password);

    if (!isPasswordValid) {
      return reply.status(401).send({
        error: 'Email ou senha inválidos',
      });
    }

    const jwtToken = request.server.jwt.sign({ userId: user.id });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber || undefined,
      },
      token: jwtToken,
      userToken: user.token || '',
    };

    return reply.status(200).send(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Erro de validação',
        details: error.message,
      });
    }

    console.error('Erro no login:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const validatedData = forgotPasswordSchema.parse(request.body);
    const { email } = validatedData;

    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      // Return success even if user doesn't exist for security
      return reply.status(200).send({
        message: 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.',
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await userRepository.save(user);

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't reveal email sending failure to user for security
    }

    return reply.status(200).send({
      message: 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Erro de validação',
        details: error.message,
      });
    }

    console.error('Erro ao solicitar redefinição de senha:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};

export const resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const validatedData = resetPasswordSchema.parse(request.body);
    const { token, password } = validatedData;

    const user = await userRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return reply.status(400).send({
        error: 'Token de redefinição inválido ou expirado',
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await userRepository.save(user);

    return reply.status(200).send({
      message: 'Senha redefinida com sucesso',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Erro de validação',
        details: error.message,
      });
    }

    console.error('Erro ao redefinir senha:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};

export const whoami = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (request.user as { userId: string }).userId;
    
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'phoneNumber'],
    });

    if (!user) {
      return reply.status(404).send({
        error: 'Usuário não encontrado',
      });
    }

    return reply.status(200).send({
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};