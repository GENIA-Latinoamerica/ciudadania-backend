import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { ApiAuthClient } from '@app/api-commons/api-clients/internal-clients/auth';
import { CommonErrorsEnum } from '@app/api-commons/enums/common-errors.enum';
import { IToken } from '@app/api-commons/interfaces/token.interface';

/**
 * transform json on authorization headers into User class and inject into request
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);
  constructor(private apiAuthClient: ApiAuthClient) {}

  async use(req: any, res: Response, next: NextFunction) {
    try {
      let authHeader = req.headers.authorization;
      if (authHeader && authHeader !== 'null') {
        authHeader = authHeader.replace('Bearer ', '');
        const tokenDto: IToken =
          await this.apiAuthClient.verifyToken(authHeader);
        if (!tokenDto) {
          throw new UnauthorizedException(CommonErrorsEnum.TOKEN_EXPIRED);
        }
        req.token = tokenDto;
      } else {
        throw new UnauthorizedException(CommonErrorsEnum.FORBIDDEN);
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        this.logger.error(
          `Verify that the api is marked as protected and process by the api-gateway. ${e}`,
        );
      } else {
        this.logger.error(e);
      }
      throw new UnauthorizedException(CommonErrorsEnum.NOT_AUTHORIZED);
    }
    next();
  }
}
