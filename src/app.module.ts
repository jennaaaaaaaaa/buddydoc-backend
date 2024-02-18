import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { userModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { infoModule } from './modules/myinfo/info.module';
import { authModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    userModule,
    infoModule,
    authModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
