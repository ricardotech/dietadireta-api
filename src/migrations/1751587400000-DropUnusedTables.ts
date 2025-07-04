import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUnusedTables1751587400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop tables that are no longer needed
    // These tables were created by the unused entities but never used
    
    // Drop user meal selection tables
    await queryRunner.query(`DROP TABLE IF EXISTS "user_breakfast" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_morning_snack" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_lunch" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_afternoon_snack" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_dinner" CASCADE`);
    
    // Drop user activity table
    await queryRunner.query(`DROP TABLE IF EXISTS "user_activity" CASCADE`);
    
    // Drop body measurements table
    await queryRunner.query(`DROP TABLE IF EXISTS "body_measurements" CASCADE`);
    
    // Drop users table (replaced by user_data)
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    
    console.log('✅ Dropped unused tables successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the tables if needed (not recommended as they were unused)
    console.log('⚠️  This migration removes unused tables. Down migration not implemented as these tables were not being used.');
  }
}
