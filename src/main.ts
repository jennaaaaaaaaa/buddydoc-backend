import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // cors 활성화
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // { whitelist: true, forbidNonWhitelisted: true, transform: true }
  await app.listen(3000);
}
bootstrap();
