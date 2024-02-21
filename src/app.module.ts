import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AppController } from './app.controller';
import { postModule } from './modules/posts/posts.module';
import { AppService } from './app.service';
import { userModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { infoModule } from './modules/myinfo/info.module';
import { authModule } from './auth/auth.module';
import { S3Service } from './providers/aws/s3/s3.service';
import { S3Module } from './providers/aws/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    userModule,
    infoModule,
    authModule,
    postModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
