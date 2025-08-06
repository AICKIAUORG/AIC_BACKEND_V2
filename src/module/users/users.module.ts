import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { UserEntity } from "./entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { AuthService } from "src/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { OneTimeToken } from "src/auth/entities/one-time-token.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      OneTimeToken
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthGuard,
    AuthService,
    JwtService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
