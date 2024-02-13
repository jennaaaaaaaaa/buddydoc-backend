import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './utils/swagger/swagger';
import { HttpExceptionFilter } from './common/http-exception.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // cors 활성화
  setupSwagger(app);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
  
}
bootstrap();
