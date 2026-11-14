import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    const normalizedRole = user.role === 'HANH_CHINH' ? Role.NV_HANH_CHINH : user.role;
    const hasRole = requiredRoles.includes(normalizedRole);
    if (!hasRole) {
      throw new ForbiddenException('Bạn không đủ quyền hạn chuyên môn');
    }

    return true;
  }
}
