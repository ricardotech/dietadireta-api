import { AppDataSource } from '../config/database';

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Since we consolidated all entities into UserData,
    // no seeding is needed for meal items anymore.
    // Meal preferences are now stored directly in UserData as arrays.
    
    console.log('Database seeding completed successfully - no seed data needed with UserData entity');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};