import { NestFactory } from '@nestjs/core';
import { ApiUserModule } from './api-user.module';
import * as multer from 'multer';
import {
  Logger,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { BadRequestError } from '@app/api-commons/errors/bad-request.error';

async function bootstrap() {
  const app = await NestFactory.create(ApiUserModule);
  app.setGlobalPrefix('api');
  app.use(multer().single('image'));
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
    console.log(ApiUserModule.name + ' Listen on PORT: ' + process.env.PORT);
  });
}
bootstrap();
