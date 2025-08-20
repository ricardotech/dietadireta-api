import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSupplementationSupport1752300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add supplementation fields to user_data table
        await queryRunner.query(`
            ALTER TABLE user_data 
            ADD COLUMN uses_supplements BOOLEAN DEFAULT false,
            ADD COLUMN supplements TEXT[] DEFAULT '{}',
            ADD COLUMN supplement_schedule JSONB DEFAULT '{}',
            ADD COLUMN supplement_brands JSONB DEFAULT '{}'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove supplementation fields
        await queryRunner.query(`
            ALTER TABLE user_data 
            DROP COLUMN IF EXISTS uses_supplements,
            DROP COLUMN IF EXISTS supplements,
            DROP COLUMN IF EXISTS supplement_schedule,
            DROP COLUMN IF EXISTS supplement_brands
        `);
    }
}