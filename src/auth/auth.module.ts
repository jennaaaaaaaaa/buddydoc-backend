import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { KakaoStrategy } from './oauth/kakao/kakao-strategy';
import { GoogleStrategy } from './oauth/google/google-strategy';
import { NaverStrategy } from './oauth/naver/naver-strategy';
import { UtilsModule } from 'src/utils/utils.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt-strategy';

import { UserModule } from 'src/modules/user/user.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    UtilsModule,
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory:(config:ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: config.get('JWT_EXPIRESIN') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, KakaoStrategy, GoogleStrategy, NaverStrategy, JwtStrategy],
})
export class AuthModule {}
