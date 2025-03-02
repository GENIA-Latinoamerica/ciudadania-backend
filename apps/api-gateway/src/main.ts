import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import {
  Logger,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { BadRequestError } from '@app/api-commons/errors/bad-request.error';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        new Logger('Global Pipes').error(JSON.stringify(validationErrors));
        throw new BadRequestError(
          JSON.stringify(
            validationErrors.map((x) => ({
              property: x.property,
              value: x.value,
              constraints: x.constraints,
            })),
          ),
        );
      },
    }),
  );
  app.enableVersioning({ type: VersioningType.URI });
  await app.listen(process.env.PORT, () => {
    console.log(ApiGatewayModule.name + ' Listen on PORT: ' + process.env.PORT);
  });
}
bootstrap();
