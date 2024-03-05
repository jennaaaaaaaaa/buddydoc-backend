import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AlarmService } from './alarm.service';
import { AlarmController } from './alarm.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AlarmController],
  providers: [AlarmService],
})
export class AlarmModule {}
