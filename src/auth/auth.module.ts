import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { KakaoStrategy } from './oauth/kakao/kakao-strategy';
import { GoogleStrategy } from './oauth/google/google-strategy';
import { NaverStrategy } from './oauth/naver/naver-strategy';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [PrismaModule,UtilsModule],
  controllers: [AuthController],
  providers: [AuthService, KakaoStrategy, GoogleStrategy, NaverStrategy],
})
export class authModule {}
