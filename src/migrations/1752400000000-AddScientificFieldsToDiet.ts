import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddScientificFieldsToDiet1752400000000 implements MigrationInterface {
    name = 'AddScientificFieldsToDiet1752400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if columns already exist before adding
        const table = await queryRunner.getTable("diets");
        
        if (!table?.columns.find(col => col.name === "description")) {
            await queryRunner.addColumn("diets", new TableColumn({
                name: "description",
                type: "varchar",
                length: "255",
                isNullable: true
            }));
        }

        if (!table?.columns.find(col => col.name === "trainingFrequency")) {
            await queryRunner.addColumn("diets", new TableColumn({
                name: "trainingFrequency",
                type: "varchar",
                length: "20",
                isNullable: true
            }));
        }

        if (!table?.columns.find(col => col.name === "activityType")) {
            await queryRunner.addColumn("diets", new TableColumn({
                name: "activityType",
                type: "varchar",
                length: "50",
                isNullable: true
            }));
        }

        if (!table?.columns.find(col => col.name === "macroDistribution")) {
            await queryRunner.addColumn("diets", new TableColumn({
                name: "macroDistribution",
                type: "jsonb",
                isNullable: true
            }));
        }

        if (!table?.columns.find(col => col.name === "scientificValidation")) {
            await queryRunner.addColumn("diets", new TableColumn({
                name: "scientificValidation",
                type: "jsonb",
                isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("diets", "scientificValidation");
        await queryRunner.dropColumn("diets", "macroDistribution");
        await queryRunner.dropColumn("diets", "activityType");
        await queryRunner.dropColumn("diets", "trainingFrequency");
        await queryRunner.dropColumn("diets", "description");
    }
}