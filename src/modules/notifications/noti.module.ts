import { Module } from '@nestjs/common';
import { NotiContoller } from './noti.controller';
import { NotiService } from './noti.service';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AlarmModule } from '../alarm/alarm.module';
import { AlarmGateway } from '../alarm/alarm.gateway';
@Module({
  imports: [PrismaModule],
  controllers: [NotiContoller],
  providers: [NotiService,AlarmGateway],
})
export class NotiModule {}
