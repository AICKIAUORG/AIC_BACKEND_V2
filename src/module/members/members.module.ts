import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberEntity } from "./entities/members.entity";
import { MembersController } from "./members.controller";
import { MembersService } from "./members.service";
import { DocumentEntity } from "./entities/document.entity";
import { S3Service } from "../S3/s3.service";
import { AuthService } from "src/auth/auth.service";
import { AuthModule } from "src/auth/auth.module";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { AdminService } from "src/admin/admin.service";

@Module({
    imports: [TypeOrmModule.forFeature([MemberEntity, DocumentEntity]),AuthModule],
    controllers: [MembersController],
    providers: [MembersService, S3Service, AuthService, AdminService],
    exports: [MembersService],
})

export class MembersModule {}