import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm"
import { OneTimeToken } from "src/auth/entities/one-time-token.entity"
export class TypeOrmConfig implements TypeOrmOptionsFactory{
    createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const { DB_HOST,DB_NAME,DB_PASSWORD,DB_PORT,DB_USERNAME } = process.env
    return {
        type: "mysql",
        host : DB_HOST,
        port : DB_PORT,
        database : DB_NAME,
        username : DB_USERNAME,
        password : DB_PASSWORD,
        synchronize : false,
        // dropSchema : true,
        // entities : [OneTimeToken],
        entities: [ 
            "dist/**/**/**/*.entity.{ts,js}",
            "dist/**/**/*.entity.{ts,js}",
          ],
        migrations: [
            "dist/migrations/*.{ts,js}"
        ],
        migrationsRun: true,
        }  
    }   
}        