import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

const proxyFunction = function (req: Request): string {
  return req.proxyTarjetUrl.toString();
};

@Injectable()
export class ReverseProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ReverseProxyMiddleware.name);

  private proxy = createProxyMiddleware({
    changeOrigin: true, // needed for virtual hosted sites
    router: proxyFunction,
    onProxyReq: (proxyReq, req) => {
      this.logger.debug(
        `Proxying ${req.method} request originally made to '${req.originalUrl}'...`,
      );
      fixRequestBody(proxyReq, req);
    },
    onError: (err, req, res) => {
      this.logger.debug('An error occurred while proxying the request:', err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'There is a problem with the service, try later',
      });
    },
  });

  use(req: Request, res: Response, next: () => void) {
    this.proxy(req, res, next);
  }
}
