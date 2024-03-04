import { Module } from '@nestjs/common';
import { NotiContoller } from './noti.controller';
import { NotiService } from './noti.service';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AlarmModule } from '../alarm/alarm.module';
import { AlarmGateway } from '../alarm/alarm.gateway';
import { AlarmService } from '../alarm/alarm.service';
@Module({
  imports: [PrismaModule],
  controllers: [NotiContoller],
  providers: [NotiService,AlarmGateway,AlarmService],
})
export class NotiModule {}
