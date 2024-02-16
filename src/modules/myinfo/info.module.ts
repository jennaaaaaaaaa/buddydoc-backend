import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';


@Module({
    controllers : [InfoController],
    providers : [InfoService],
    imports : [PrismaModule],
})

export class infoModule {}
