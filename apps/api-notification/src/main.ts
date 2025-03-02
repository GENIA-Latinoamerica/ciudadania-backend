import { NestFactory } from '@nestjs/core';
import * as multer from 'multer';
import {
  Logger,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { BadRequestError } from '@app/api-commons/errors/bad-request.error';
import { ApiNotificationModule } from './api-notification.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiNotificationModule);
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
    console.log(ApiNotificationModule.name + ' Listen on PORT: ' + process.env.PORT);
  });
}
bootstrap();
