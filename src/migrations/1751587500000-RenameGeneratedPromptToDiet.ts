import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameGeneratedPromptToDiet1751587500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for order status first
    await queryRunner.query(`CREATE TYPE "diets_orderstatus_enum" AS ENUM('pending', 'processing', 'completed', 'cancelled', 'delivered')`);

    // Rename the table from generated_prompts to diets
    await queryRunner.query(`ALTER TABLE "generated_prompts" RENAME TO "diets"`);

    // Add new columns
    await queryRunner.query(`ALTER TABLE "diets" ADD "orderId" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "diets" ADD "orderStatus" "diets_orderstatus_enum" NOT NULL DEFAULT 'pending'`);

    // Create index on orderId
    await queryRunner.query(`CREATE INDEX "IDX_diets_orderId" ON "diets" ("orderId")`);

    console.log('✅ Successfully renamed generated_prompts to diets and added new columns');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the new columns
    await queryRunner.query(`DROP INDEX "IDX_diets_orderId"`);
    await queryRunner.query(`ALTER TABLE "diets" DROP COLUMN "orderStatus"`);
    await queryRunner.query(`ALTER TABLE "diets" DROP COLUMN "orderId"`);
    
    // Drop the enum type
    await queryRunner.query(`DROP TYPE "diets_orderstatus_enum"`);
    
    // Rename the table back
    await queryRunner.query(`ALTER TABLE "diets" RENAME TO "generated_prompts"`);
    
    console.log('✅ Successfully reverted diets table back to generated_prompts');
  }
}
