import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './utils/swagger/swagger';
import { HttpExceptionFilter } from './common/http-exception.filter';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    credentials:true
  }); // cors 활성화;
  app.use(cookieParser())
  setupSwagger(app);
  app.useGlobalFilters(new HttpExceptionFilter());
  
  await app.listen(3000);
  
}
bootstrap();
