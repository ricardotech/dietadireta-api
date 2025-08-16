import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHealthConditions1752100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add health conditions columns to user_data table
    await queryRunner.query(`
      ALTER TABLE user_data
      ADD COLUMN IF NOT EXISTS condicoes_saude TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS alergias_alimentares TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS restricoes_alimentares TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS observacoes_medicas TEXT
    `);
    
    // Add diet mode columns for calorie-based creation
    await queryRunner.query(`
      ALTER TABLE user_data
      ADD COLUMN IF NOT EXISTS diet_mode VARCHAR(20) DEFAULT 'complete',
      ADD COLUMN IF NOT EXISTS custom_calories INTEGER,
      ADD COLUMN IF NOT EXISTS skip_measurements BOOLEAN DEFAULT FALSE
    `);
    
    // Add constraint for diet mode
    await queryRunner.query(`
      ALTER TABLE user_data
      DROP CONSTRAINT IF EXISTS check_diet_mode
    `);
    
    await queryRunner.query(`
      ALTER TABLE user_data
      ADD CONSTRAINT check_diet_mode
      CHECK (diet_mode IN ('complete', 'calories_only', 'quick'))
    `);
  }
  
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove diet mode constraint
    await queryRunner.query(`
      ALTER TABLE user_data
      DROP CONSTRAINT IF EXISTS check_diet_mode
    `);
    
    // Remove columns
    await queryRunner.query(`
      ALTER TABLE user_data
      DROP COLUMN IF EXISTS condicoes_saude,
      DROP COLUMN IF EXISTS alergias_alimentares,
      DROP COLUMN IF EXISTS restricoes_alimentares,
      DROP COLUMN IF EXISTS observacoes_medicas,
      DROP COLUMN IF EXISTS diet_mode,
      DROP COLUMN IF EXISTS custom_calories,
      DROP COLUMN IF EXISTS skip_measurements
    `);
  }
}