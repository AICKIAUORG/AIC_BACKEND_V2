import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm"
import { OneTimeToken } from "src/auth/entities/one-time-token.entity"
import * as dotenv from "dotenv";
import { UserEntity } from "src/module/users/entities/user.entity";
import { MemberEntity } from "src/module/members/entities/members.entity";
import { AdminEntity } from "src/admin/entities/admin.entity";
import { PermissionEntity } from "src/admin/entities/permission.entity";
import { DocumentEntity } from "src/module/members/entities/document.entity";
import { DepartmentEntity } from "src/module/departments/entities/department.entity";
import { CommissionEntity } from "src/module/commissions/entities/commission.entity";
dotenv.config();
export class TypeOrmConfig implements TypeOrmOptionsFactory{
    createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const { DB_HOST,DB_NAME,DB_PASSWORD,DB_PORT,DB_USERNAME } = process.env
    return {
        type: "postgres",
        host : DB_HOST,
        port : DB_PORT,
        database : DB_NAME,
        username : DB_USERNAME,
        password : DB_PASSWORD,
        synchronize : true,
        dropSchema : false,
        logging : false,
        // entities : [OneTimeToken, UserEntity, MemberEntity, AdminEntity, PermissionEntity, DocumentEntity, DepartmentEntity, CommissionEntity],
        entities: [ 
            "dist/**/**/**/*.entity.{ts,js}",
            "dist/**/**/*.entity.{ts,js}",
          ],
        // migrations: [
        //     "dist/migrations/*.{ts,js}"
        // ],
        // migrationsRun: true,
        }  
    }   
}        