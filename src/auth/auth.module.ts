import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { KakaoStrategy } from './oauth/kakao-strategy';
import { SessionSerializer } from './oauth/session.serializer';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, KakaoStrategy, SessionSerializer],
})
export class authModule {}
