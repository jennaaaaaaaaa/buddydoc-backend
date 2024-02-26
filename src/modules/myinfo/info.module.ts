import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [InfoController],
  providers: [InfoService, UserService],
})
export class InfoModule {}
