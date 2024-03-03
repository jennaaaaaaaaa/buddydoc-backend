import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AppController } from './app.controller';
import { postModule } from './modules/posts/posts.module';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { InfoModule } from './modules/myinfo/info.module';
import { AuthModule } from './auth/auth.module';
import { S3Service } from './providers/aws/s3/s3.service';
import { S3Module } from './providers/aws/s3/s3.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotiModule } from './modules/notifications/noti.module';
import { AlarmModule } from './modules/alarm/alarm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    InfoModule,
    AuthModule,
    postModule,
    S3Module,
    ChatModule,
    NotiModule,
    AlarmModule
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
