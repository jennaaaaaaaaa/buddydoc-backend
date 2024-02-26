import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './utils/swagger/swagger';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SearchService } from './modules/posts/search/search.service';

//elastic서버 연결부분
// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.enableCors({
//     credentials: true,
//   }); // cors 활성화;
//   app.use(cookieParser());
//   setupSwagger(app);
//   app.useGlobalFilters(new HttpExceptionFilter());

//   // ElasticsearchService 인스턴스를 가져옵니다.
//   const elasticsearchService = app.get(SearchService);
//   // Elasticsearch를 초기화합니다.
//   await elasticsearchService.init();

//   await app.listen(3000);
// }
// bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST'], // 허용할 HTTP method
    credentials: true, // 쿠키 인증 요청 허용
    maxAge: 3000, // pre-flight 리퀘스트를 캐싱할 시간
  }); // cors 활성화;
  app.use(cookieParser());
  setupSwagger(app);
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
