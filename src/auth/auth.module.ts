import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "./guard/auth.guard";
import { UserEntity } from "src/module/users/entities/user.entity";
import { OneTimeToken } from "./entities/one-time-token.entity";
import { AdminService } from "src/admin/admin.service";
import { AdminEntity } from "src/admin/entities/admin.entity";
import { PermissionEntity } from "src/admin/entities/permission.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OneTimeToken, AdminEntity, PermissionEntity])],
  controllers: [AuthController],
  providers: [AuthService, JwtService, AuthGuard, AdminService],
  exports: [AuthService, JwtService, TypeOrmModule],
})
export class AuthModule {}
