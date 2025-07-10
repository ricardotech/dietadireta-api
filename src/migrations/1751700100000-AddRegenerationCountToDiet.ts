import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRegenerationCountToDiet1751700100000 implements MigrationInterface {
    name = 'AddRegenerationCountToDiet1751700100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diets" ADD "regenerationCount" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "diets" DROP COLUMN "regenerationCount"`);
    }
}
