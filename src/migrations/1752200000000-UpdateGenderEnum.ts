import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGenderEnum1752200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, update the existing values to the new format
        await queryRunner.query(`
            UPDATE user_data 
            SET genero = CASE 
                WHEN genero = 'm' THEN 'masculino'
                WHEN genero = 'f' THEN 'feminino'
                ELSE genero
            END
        `);

        // Drop the old enum type and create the new one
        await queryRunner.query(`
            ALTER TYPE genero RENAME TO genero_old;
        `);

        await queryRunner.query(`
            CREATE TYPE genero AS ENUM ('masculino', 'feminino', 'outro', 'prefiro_nao_dizer');
        `);

        await queryRunner.query(`
            ALTER TABLE user_data 
            ALTER COLUMN genero TYPE genero USING genero::text::genero;
        `);

        await queryRunner.query(`
            DROP TYPE genero_old;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to the old enum
        await queryRunner.query(`
            UPDATE user_data 
            SET genero = CASE 
                WHEN genero = 'masculino' THEN 'm'
                WHEN genero = 'feminino' THEN 'f'
                WHEN genero = 'outro' THEN 'm'
                WHEN genero = 'prefiro_nao_dizer' THEN 'm'
                ELSE genero
            END
        `);

        await queryRunner.query(`
            ALTER TYPE genero RENAME TO genero_old;
        `);

        await queryRunner.query(`
            CREATE TYPE genero AS ENUM ('m', 'f');
        `);

        await queryRunner.query(`
            ALTER TABLE user_data 
            ALTER COLUMN genero TYPE genero USING 
            CASE 
                WHEN genero::text = 'masculino' THEN 'm'::genero
                WHEN genero::text = 'feminino' THEN 'f'::genero
                ELSE 'm'::genero
            END;
        `);

        await queryRunner.query(`
            DROP TYPE genero_old;
        `);
    }
}