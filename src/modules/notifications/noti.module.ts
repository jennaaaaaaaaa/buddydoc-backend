import { Module } from '@nestjs/common';
import { NotiContoller } from './noti.controller';
import { NotiService } from './noti.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotiContoller],
  providers: [NotiService],
})
export class NotiModule {}
