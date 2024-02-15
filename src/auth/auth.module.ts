import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { KakaoStrategy } from './oauth/kakao-strategy';

@Module({
    imports : [PrismaModule],
    controllers : [AuthController],
    providers : [AuthService,KakaoStrategy],
    
})

export class authModule {}
