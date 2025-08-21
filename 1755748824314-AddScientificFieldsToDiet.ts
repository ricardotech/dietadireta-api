import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScientificFieldsToDiet1755748824314 implements MigrationInterface {
    name = 'AddScientificFieldsToDiet1755748824314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_data" ADD "uses_supplements" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_data" ADD "supplements" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "user_data" ADD "supplement_schedule" jsonb`);
        await queryRunner.query(`ALTER TABLE "user_data" ADD "supplement_brands" jsonb`);
        await queryRunner.query(`ALTER TYPE "public"."user_data_genero_enum" RENAME TO "user_data_genero_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_data_genero_enum" AS ENUM('masculino', 'feminino', 'outro', 'prefiro_nao_dizer')`);
        await queryRunner.query(`ALTER TABLE "user_data" ALTER COLUMN "genero" TYPE "public"."user_data_genero_enum" USING "genero"::"text"::"public"."user_data_genero_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_data_genero_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_data_genero_enum_old" AS ENUM('m', 'f')`);
        await queryRunner.query(`ALTER TABLE "user_data" ALTER COLUMN "genero" TYPE "public"."user_data_genero_enum_old" USING "genero"::"text"::"public"."user_data_genero_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_data_genero_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_data_genero_enum_old" RENAME TO "user_data_genero_enum"`);
        await queryRunner.query(`ALTER TABLE "user_data" DROP COLUMN "supplement_brands"`);
        await queryRunner.query(`ALTER TABLE "user_data" DROP COLUMN "supplement_schedule"`);
        await queryRunner.query(`ALTER TABLE "user_data" DROP COLUMN "supplements"`);
        await queryRunner.query(`ALTER TABLE "user_data" DROP COLUMN "uses_supplements"`);
    }

}
