import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCaloriasDiariasToInteger1735960000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Converting caloriasDiarias from enum to integer...');
    
    // First, update any null values to a default value (2000 calories)
    await queryRunner.query(`
      UPDATE "user_data" 
      SET "caloriasDiarias" = '2000' 
      WHERE "caloriasDiarias" IS NULL OR "caloriasDiarias" = '0'
    `);
    
    // Create a mapping for existing enum values to integers
    await queryRunner.query(`
      UPDATE "user_data" 
      SET "caloriasDiarias" = 
        CASE 
          WHEN "caloriasDiarias" = '1200' THEN '1200'
          WHEN "caloriasDiarias" = '1500' THEN '1500'
          WHEN "caloriasDiarias" = '1800' THEN '1800'
          WHEN "caloriasDiarias" = '2000' THEN '2000'
          WHEN "caloriasDiarias" = '2200' THEN '2200'
          WHEN "caloriasDiarias" = '2500' THEN '2500'
          WHEN "caloriasDiarias" = '2800' THEN '2800'
          WHEN "caloriasDiarias" = '3000' THEN '3000'
          ELSE '2000'
        END
    `);
    
    // Drop the enum type constraint and change column to integer
    await queryRunner.query(`
      ALTER TABLE "user_data" 
      ALTER COLUMN "caloriasDiarias" TYPE integer 
      USING "caloriasDiarias"::integer
    `);
    
    // Make sure the column is NOT NULL
    await queryRunner.query(`
      ALTER TABLE "user_data" 
      ALTER COLUMN "caloriasDiarias" SET NOT NULL
    `);
    
    // Drop the enum type if it exists
    await queryRunner.query(`
      DROP TYPE IF EXISTS "user_data_caloriasDiarias_enum" CASCADE
    `);
    
    console.log('✅ Successfully converted caloriasDiarias to integer');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Reverting caloriasDiarias back to enum...');
    
    // Recreate the enum type
    await queryRunner.query(`
      CREATE TYPE "user_data_caloriasDiarias_enum" AS ENUM('0', '1200', '1500', '1800', '2000', '2200', '2500', '2800', '3000')
    `);
    
    // Convert back to enum
    await queryRunner.query(`
      ALTER TABLE "user_data" 
      ALTER COLUMN "caloriasDiarias" TYPE "user_data_caloriasDiarias_enum" 
      USING "caloriasDiarias"::text::"user_data_caloriasDiarias_enum"
    `);
    
    console.log('✅ Successfully reverted caloriasDiarias back to enum');
  }
}
