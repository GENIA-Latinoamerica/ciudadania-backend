import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleEnum } from '../enums/role.enum';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenError } from '../errors/forbidden.error';
import { CommonErrorsEnum } from '../enums/common-errors.enum';
//import { TokenService } from '../token/token.service';
//import { IToken } from '../interfaces/token.interface';
/**
 * to apply Rol authorization on methods decorated with @Roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    let roles: RoleEnum[] = [];
    const { token } = context.switchToHttp().getRequest();
    if (token) {
      roles = token.roles;
    }
    const result = requiredRoles.some((role) => roles?.includes(role));
    if (!result) {
      throw new ForbiddenError(CommonErrorsEnum.FORBIDDEN);
    }
    return true;
  }

  private convertStringsToEnums<T extends Record<string, string | number>>(
    stringArray: (string | number)[],
    enumType: T,
  ): (T[keyof T] | undefined)[] {
    return stringArray.map((value) => enumType[value as keyof T]);
  }
}
