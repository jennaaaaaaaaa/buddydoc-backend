import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AlarmGateway } from './alarm.gateway';

@Module({
  imports: [PrismaModule],
  providers: [AlarmGateway],
})
export class AlarmModule {}
