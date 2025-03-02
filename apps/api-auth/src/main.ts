import { NestFactory } from '@nestjs/core';
import { ApiAuthModule } from './api-auth.module';
import {
  ValidationPipe,
  ValidationError,
  Logger,
  VersioningType,
} from '@nestjs/common';
import { BadRequestError } from '@app/api-commons/errors/bad-request.error';

async function bootstrap() {
  const app = await NestFactory.create(ApiAuthModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
  });
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
  await app.listen(process.env.PORT, () => {
    console.log(ApiAuthModule.name + ' Listen on PORT: ' + process.env.PORT);
  });
}
bootstrap();
