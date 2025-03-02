import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { TokenService } from '../auth/token.service';
import { CommonErrorsEnum } from '@app/api-commons/enums/common-errors.enum';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(private tokenService: TokenService) {}

  async use(req: any, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader !== 'null') {
        const token: string = authHeader.replace('Bearer ', '');
        req.token = await this.tokenService.verifyToken(token);
        const lastToken = await this.tokenService.findLastToken(req.token._id);
        if (lastToken && lastToken.jwt === token) {
          this.logger.debug(`The token has been successfully verified.`);
        } else {
          throw new UnauthorizedException(CommonErrorsEnum.TOKEN_EXPIRED);
        }
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
