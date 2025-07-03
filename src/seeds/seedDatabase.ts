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
  dinnerSeedData 
} from './seedData';

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    const breakfastRepository = AppDataSource.getRepository(BreakfastItem);
    const morningSnackRepository = AppDataSource.getRepository(MorningSnackItem);
    const lunchRepository = AppDataSource.getRepository(LunchItem);
    const afternoonSnackRepository = AppDataSource.getRepository(AfternoonSnackItem);
    const dinnerRepository = AppDataSource.getRepository(DinnerItem);

    // Seed breakfast items
    const existingBreakfastItems = await breakfastRepository.count();
    if (existingBreakfastItems === 0) {
      await breakfastRepository.save(breakfastSeedData);
      console.log('✅ Breakfast items seeded');
    } else {
      console.log('⏭️ Breakfast items already exist, skipping');
    }

    // Seed morning snack items
    const existingMorningSnackItems = await morningSnackRepository.count();
    if (existingMorningSnackItems === 0) {
      await morningSnackRepository.save(morningSnackSeedData);
      console.log('✅ Morning snack items seeded');
    } else {
      console.log('⏭️ Morning snack items already exist, skipping');
    }

    // Seed lunch items
    const existingLunchItems = await lunchRepository.count();
    if (existingLunchItems === 0) {
      await lunchRepository.save(lunchSeedData);
      console.log('✅ Lunch items seeded');
    } else {
      console.log('⏭️ Lunch items already exist, skipping');
    }

    // Seed afternoon snack items
    const existingAfternoonSnackItems = await afternoonSnackRepository.count();
    if (existingAfternoonSnackItems === 0) {
      await afternoonSnackRepository.save(afternoonSnackSeedData);
      console.log('✅ Afternoon snack items seeded');
    } else {
      console.log('⏭️ Afternoon snack items already exist, skipping');
    }

    // Seed dinner items
    const existingDinnerItems = await dinnerRepository.count();
    if (existingDinnerItems === 0) {
      await dinnerRepository.save(dinnerSeedData);
      console.log('✅ Dinner items seeded');
    } else {
      console.log('⏭️ Dinner items already exist, skipping');
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};