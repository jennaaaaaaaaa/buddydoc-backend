import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { UserService } from '../user/user.service';
import { NotiService } from '../notifications/noti.service';

@Module({
  imports: [PrismaModule],
  controllers: [InfoController],
  providers: [InfoService, UserService,NotiService],
})
export class InfoModule {}
