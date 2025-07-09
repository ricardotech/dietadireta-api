import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCpfToUserData1751700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user_data',
      new TableColumn({
        name: 'cpf',
        type: 'varchar',
        length: '14',
        isUnique: true,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_data', 'cpf');
  }
}
