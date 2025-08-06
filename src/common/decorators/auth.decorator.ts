import {UseGuards, applyDecorators} from "@nestjs/common";
import {ApiBearerAuth} from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guard/auth.guard";

export function UserAuth() {
  return applyDecorators(
    ApiBearerAuth("Authorization"),
    UseGuards(AuthGuard));
}
