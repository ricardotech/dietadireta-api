import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGenderEnum1752200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Just add new values to the enum without updating existing data
        // The existing 'm' and 'f' values can stay as they are
        
        // Add new values to existing enum if they don't exist
        await queryRunner.query(`
            ALTER TYPE user_data_genero_enum ADD VALUE IF NOT EXISTS 'masculino';
        `);
        await queryRunner.query(`
            ALTER TYPE user_data_genero_enum ADD VALUE IF NOT EXISTS 'feminino';
        `);
        await queryRunner.query(`
            ALTER TYPE user_data_genero_enum ADD VALUE IF NOT EXISTS 'outro';
        `);
        await queryRunner.query(`
            ALTER TYPE user_data_genero_enum ADD VALUE IF NOT EXISTS 'prefiro_nao_dizer';
        `);
        
        // Note: We're not updating existing 'm' and 'f' values
        // They can coexist with the new values
        // New records will use the new values
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL doesn't support removing enum values
        // So we can't really revert this migration
        // The best we can do is document this limitation
        console.log("Warning: Cannot remove enum values in PostgreSQL. Manual intervention may be required.");
    }
}