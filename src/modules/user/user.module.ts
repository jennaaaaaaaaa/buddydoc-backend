import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { JwtAuthGuard } from 'src/auth/oauth/auth.guard'

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService,JwtAuthGuard],
  exports: [UserService],
})
export class UserModule {}
