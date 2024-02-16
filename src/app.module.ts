import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { postModule } from './modules/posts/posts.module';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
// import { SearchModule } from './modules/search/search.module'; //검색
import { S3Service } from './providers/aws/s3/s3.service';
import { S3Module } from './providers/aws/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전체적으로 사용
    }),
    postModule,
    S3Module,
  ], //SearchModule 검색관련
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule {}
