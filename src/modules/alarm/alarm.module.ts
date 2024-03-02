import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AlarmController } from './alarm.controller';
import { AlarmGateway } from './alarm.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [AlarmController],
  providers: [AlarmGateway],
})
export class AlarmModule {}
