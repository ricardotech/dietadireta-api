import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDietRegenerationFields implements MigrationInterface {
    name = 'AddDietRegenerationFields'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diets" ADD "isRegenerated" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "diets" ADD "regenerationFeedback" text`);
        await queryRunner.query(`ALTER TABLE "diets" ADD "originalDietId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diets" DROP COLUMN "originalDietId"`);
        await queryRunner.query(`ALTER TABLE "diets" DROP COLUMN "regenerationFeedback"`);
        await queryRunner.query(`ALTER TABLE "diets" DROP COLUMN "isRegenerated"`);
    }
}