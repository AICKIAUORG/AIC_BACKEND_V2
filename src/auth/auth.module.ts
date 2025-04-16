import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "./guard/auth.guard";
import { UserEntity } from "src/module/users/entities/user.entity";
import { OneTimeToken } from "./entities/one-time-token.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OneTimeToken])],
  controllers: [AuthController],
  providers: [AuthService, JwtService, AuthGuard],
  exports: [AuthService, JwtService, TypeOrmModule],
})
export class AuthModule {}
