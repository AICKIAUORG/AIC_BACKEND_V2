import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { isJWT } from "class-validator";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY, ROLE_KEY } from "src/common/decorators/roles.decorator";
import { AdminService } from "src/admin/admin.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private reflector: Reflector
  ) {}
  async canActivate(context: ExecutionContext) {
    const requiredRole: number[] = this.reflector.get(
      ROLE_KEY,
      context.getHandler()
    );
    const requiredPermission: Number[] = this.reflector.get(
      PERMISSION_KEY,
      context.getHandler()
    );
    const httpRequest = context.switchToHttp();
    const request: Request = httpRequest.getRequest<Request>();
    const token = this.extractToken(request);
    request.user = await this.authService.validateAccessToken(token);
    console.log(request.user.member_id);
    if ((requiredRole && requiredRole.length > 0) || (requiredPermission && requiredPermission.length > 0)) {
      const access = await this.adminService.checkAccess(request.user.member_id, requiredRole, requiredPermission);
      if (access) {
        return true;
      }
      throw new UnauthorizedException("دسترسی شما به این بخش محدود میباشد.");
    }
    return true;
  }
  protected extractToken(request: Request) {
    const { authorization = undefined } = request?.headers ?? {};
    if (!authorization || authorization?.trim() == "")
      throw new UnauthorizedException("لطفا وارد اکانت خود شوید.");
    const [bearer, token] = authorization?.split(" ");
    if (bearer.toLowerCase() !== "bearer" || !token || !isJWT(token))
      throw new UnauthorizedException("لطفا وارد اکانت خود شوید.");
    return token;
  }
}
