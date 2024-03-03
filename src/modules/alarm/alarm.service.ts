import { ForbiddenException, Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AlarmDto } from './dto/alarm.dto';

@Injectable()
export class alarmService {
  constructor(private prisma: PrismaService) {}

  sendAlarm(alarmDto : AlarmDto){
    try {
        
    } catch (error) {
        
    }
  }
}
