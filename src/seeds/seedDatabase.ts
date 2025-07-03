import { AppDataSource } from '../config/database';
import { BreakfastItem } from '../entities/BreakfastItem';
import { MorningSnackItem } from '../entities/MorningSnackItem';
import { LunchItem } from '../entities/LunchItem';
import { AfternoonSnackItem } from '../entities/AfternoonSnackItem';
import { DinnerItem } from '../entities/DinnerItem';
import {
  breakfastSeedData,
  morningSnackSeedData,
  lunchSeedData,
  afternoonSnackSeedData,
  dinnerSeedData,
} from './seedData';

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    const breakfastRepository = AppDataSource.getRepository(BreakfastItem);
    const morningSnackRepository = AppDataSource.getRepository(MorningSnackItem);
    const lunchRepository = AppDataSource.getRepository(LunchItem);
    const afternoonSnackRepository = AppDataSource.getRepository(AfternoonSnackItem);
    const dinnerRepository = AppDataSource.getRepository(DinnerItem);

    const breakfastCount = await breakfastRepository.count();
    if (breakfastCount === 0) {
      console.log('Seeding breakfast items...');
      await breakfastRepository.save(breakfastSeedData);
      console.log('Breakfast items seeded successfully');
    }

    const morningSnackCount = await morningSnackRepository.count();
    if (morningSnackCount === 0) {
      console.log('Seeding morning snack items...');
      await morningSnackRepository.save(morningSnackSeedData);
      console.log('Morning snack items seeded successfully');
    }

    const lunchCount = await lunchRepository.count();
    if (lunchCount === 0) {
      console.log('Seeding lunch items...');
      await lunchRepository.save(lunchSeedData);
      console.log('Lunch items seeded successfully');
    }

    const afternoonSnackCount = await afternoonSnackRepository.count();
    if (afternoonSnackCount === 0) {
      console.log('Seeding afternoon snack items...');
      await afternoonSnackRepository.save(afternoonSnackSeedData);
      console.log('Afternoon snack items seeded successfully');
    }

    const dinnerCount = await dinnerRepository.count();
    if (dinnerCount === 0) {
      console.log('Seeding dinner items...');
      await dinnerRepository.save(dinnerSeedData);
      console.log('Dinner items seeded successfully');
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};