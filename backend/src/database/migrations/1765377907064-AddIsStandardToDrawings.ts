import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsStandardToDrawings1765377907064 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'standard_drawings',
            new TableColumn({
                name: 'isStandard',
                type: 'boolean',
                default: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('standard_drawings', 'isStandard');
    }

}
