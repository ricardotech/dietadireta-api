import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { UserData } from '../entities/UserData';
import { hashPassword, verifyPassword } from '../utils/auth';
import { SignUpRequest, SignInRequest, AuthResponse, signUpSchema, signInSchema } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';
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

    const existingUser = await userRepository.findOne({
      where: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return reply.status(400).send({
        error: 'Usuário com este email ou número de telefone já existe',
      });
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
        phoneNumber: user.phoneNumber as string,
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
        phoneNumber: user.phoneNumber as string,
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