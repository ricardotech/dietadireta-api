import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPasswordResetFields1751650000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user_data',
      new TableColumn({
        name: 'resetPasswordToken',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'user_data',
      new TableColumn({
        name: 'resetPasswordExpires',
        type: 'timestamp',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_data', 'resetPasswordExpires');
    await queryRunner.dropColumn('user_data', 'resetPasswordToken');
  }
}