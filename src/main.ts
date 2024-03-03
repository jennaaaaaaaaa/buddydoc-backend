import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './utils/swagger/swagger';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SearchService } from './modules/posts/search/search.service';
import { Server } from 'socket.io';
// elastic서버 연결부분
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
  }); // cors 활성화;
  Server.setMaxListeners(100);
  app.use(cookieParser());
  setupSwagger(app);
  app.useGlobalFilters(new HttpExceptionFilter());

  // ElasticsearchService 인스턴스를 가져옵니다.
  const elasticsearchService = app.get(SearchService);
  // Elasticsearch를 초기화합니다.
  await elasticsearchService.init();

  await app.listen(3000);
}
bootstrap();
