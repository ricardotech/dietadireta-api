import { MigrationInterface, QueryRunner } from "typeorm";
import { 
  breakfastBrazilianSeedData, 
  lunchBrazilianSeedData, 
  dinnerBrazilianSeedData, 
  morningSnackBrazilianSeedData, 
  afternoonSnackBrazilianSeedData 
} from '../seeds/brazilianFoods';

export class AddBrazilianFoodsAndTrainingFrequency1752000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add training frequency column to user_data
    await queryRunner.query(`
      ALTER TABLE user_data 
      ADD COLUMN IF NOT EXISTS frequencia_treino VARCHAR(10) DEFAULT '3-5'
    `);
    
    // Add constraint for training frequency
    await queryRunner.query(`
      ALTER TABLE user_data
      DROP CONSTRAINT IF EXISTS check_frequencia_treino
    `);
    
    await queryRunner.query(`
      ALTER TABLE user_data
      ADD CONSTRAINT check_frequencia_treino 
      CHECK (frequencia_treino IN ('1-3', '3-5', '5-7'))
    `);
    
    // Clear existing food items
    await queryRunner.query(`DELETE FROM breakfast_item`);
    await queryRunner.query(`DELETE FROM lunch_item`);
    await queryRunner.query(`DELETE FROM dinner_item`);
    await queryRunner.query(`DELETE FROM morning_snack_item`);
    await queryRunner.query(`DELETE FROM afternoon_snack_item`);
    
    // Insert Brazilian breakfast items
    for (const item of breakfastBrazilianSeedData) {
      await queryRunner.query(`
        INSERT INTO breakfast_item (name) VALUES ($1)
      `, [item.name]);
    }
    
    // Insert Brazilian lunch items
    for (const item of lunchBrazilianSeedData) {
      await queryRunner.query(`
        INSERT INTO lunch_item (name) VALUES ($1)
      `, [item.name]);
    }
    
    // Insert Brazilian dinner items
    for (const item of dinnerBrazilianSeedData) {
      await queryRunner.query(`
        INSERT INTO dinner_item (name) VALUES ($1)
      `, [item.name]);
    }
    
    // Insert Brazilian morning snack items
    for (const item of morningSnackBrazilianSeedData) {
      await queryRunner.query(`
        INSERT INTO morning_snack_item (name) VALUES ($1)
      `, [item.name]);
    }
    
    // Insert Brazilian afternoon snack items
    for (const item of afternoonSnackBrazilianSeedData) {
      await queryRunner.query(`
        INSERT INTO afternoon_snack_item (name) VALUES ($1)
      `, [item.name]);
    }
  }
  
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove training frequency constraint and column
    await queryRunner.query(`
      ALTER TABLE user_data
      DROP CONSTRAINT IF EXISTS check_frequencia_treino
    `);
    
    await queryRunner.query(`
      ALTER TABLE user_data 
      DROP COLUMN IF EXISTS frequencia_treino
    `);
    
    // Clear Brazilian foods (would need to restore original foods in production)
    await queryRunner.query(`DELETE FROM breakfast_item`);
    await queryRunner.query(`DELETE FROM lunch_item`);
    await queryRunner.query(`DELETE FROM dinner_item`);
    await queryRunner.query(`DELETE FROM morning_snack_item`);
    await queryRunner.query(`DELETE FROM afternoon_snack_item`);
  }
}