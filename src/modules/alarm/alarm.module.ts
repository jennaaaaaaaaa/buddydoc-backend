import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AlarmService } from './alarm.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [AlarmService],
})
export class AlarmModule {}
