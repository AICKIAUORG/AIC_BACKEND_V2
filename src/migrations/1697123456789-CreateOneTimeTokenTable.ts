import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateOneTimeTokenTable1697123456789 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "one_time_token",
                columns: [
                    {
                        name: "token",
                        type: "varchar",
                        length: "36",
                        isPrimary: true
                    },
                    {
                        name: "userId",
                        type: "int",
                        isNullable: false
                    },
                    {
                        name: "used",
                        type: "boolean",
                        default: false
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "expiresAt",
                        type: "timestamp",
                        isNullable: false
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("one_time_token");
    }
} 