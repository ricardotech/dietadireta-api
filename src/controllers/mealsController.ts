import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../config/database';
import { BreakfastItem } from '../entities/BreakfastItem';
import { MorningSnackItem } from '../entities/MorningSnackItem';
import { LunchItem } from '../entities/LunchItem';
import { AfternoonSnackItem } from '../entities/AfternoonSnackItem';
import { DinnerItem } from '../entities/DinnerItem';

const breakfastRepository = AppDataSource.getRepository(BreakfastItem);
const morningSnackRepository = AppDataSource.getRepository(MorningSnackItem);
const lunchRepository = AppDataSource.getRepository(LunchItem);
const afternoonSnackRepository = AppDataSource.getRepository(AfternoonSnackItem);
const dinnerRepository = AppDataSource.getRepository(DinnerItem);

export const getBreakfastItems = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const items = await breakfastRepository.find({
      order: { name: 'ASC' }
    });
    return reply.status(200).send(items);
  } catch (error) {
    console.error('Erro ao buscar itens do café da manhã:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};

export const getMorningSnackItems = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const items = await morningSnackRepository.find({
      order: { name: 'ASC' }
    });
    return reply.status(200).send(items);
  } catch (error) {
    console.error('Erro ao buscar itens do lanche da manhã:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};

export const getLunchItems = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const items = await lunchRepository.find({
      order: { name: 'ASC' }
    });
    return reply.status(200).send(items);
  } catch (error) {
    console.error('Erro ao buscar itens do almoço:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};

export const getAfternoonSnackItems = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const items = await afternoonSnackRepository.find({
      order: { name: 'ASC' }
    });
    return reply.status(200).send(items);
  } catch (error) {
    console.error('Erro ao buscar itens do lanche da tarde:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};

export const getDinnerItems = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const items = await dinnerRepository.find({
      order: { name: 'ASC' }
    });
    return reply.status(200).send(items);
  } catch (error) {
    console.error('Erro ao buscar itens da janta:', error);
    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};
