import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { UserEntity } from "./entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { AuthService } from "src/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { OneTimeToken } from "src/auth/entities/one-time-token.entity";
import { AdminService } from "src/admin/admin.service";
import { AdminEntity } from "src/admin/entities/admin.entity";
import { PermissionEntity } from "src/admin/entities/permission.entity";
import { DepartmentEntity } from "../departments/entities/department.entity";
import { MemberEntity } from "../members/entities/members.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      OneTimeToken,
      AdminEntity,
      PermissionEntity,
      DepartmentEntity,
      MemberEntity
    ]),
    
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthGuard,
    AuthService,
    JwtService,
    AdminService
  ],
  exports: [UsersService],
})
export class UsersModule {}
