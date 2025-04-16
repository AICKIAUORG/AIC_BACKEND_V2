import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } = process.env;

export const AppDataSource = new DataSource({
    type: "mysql",
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    synchronize: false,
    entities: [
        "dist/**/**/**/*.entity.{ts,js}",
        "dist/**/**/*.entity.{ts,js}",
    ],
    migrations: [
        "dist/migrations/*.{ts,js}"
    ]
});