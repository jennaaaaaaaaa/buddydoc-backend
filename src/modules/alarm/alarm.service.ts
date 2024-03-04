import { ForbiddenException, Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AlarmDto } from './dto/alarm.dto';
import { NotiDto } from '../notifications/dto/noti.dto';

@Injectable()
export class AlarmService {
  constructor(private prisma: PrismaService,
    private alarmDto : AlarmDto) {}

  /**
   * 알림 보내기
   * @param notiDto
   */
  async sendAlarm(notiDto: NotiDto) {
    try {
        
    //   this.alarmDto.userId=notiDto.userId
    //   this.alarmDto.postId=notiDto.postId
    //   this.alarmDto.noti_userid=notiDto.noti_userId
    //   this.alarmDto.alarmMessage=notiDto.noti_message

      const result = await this.prisma.applications.create({
        data: {
            postId:notiDto.postId,
            userId:notiDto.userId,
            noti_userId:notiDto.noti_userId,
            alarmMessage:notiDto.noti_message,
            createdAt:new Date,
        },
      });

      return result
    } catch (error) {
      throw { message : error}  
    }
  }

  /**
   * 게시물로 userId 불러오기
   * @param postId
   * @returns
   */
  async getUserIdatPost(postId: Number) {
    try {
      const post_userId = await this.prisma.posts.findFirst({
        where: {
          postId: Number(postId),
        },
        select: {
          post_userId: true,
        },
      });

      return post_userId.post_userId;
    } catch (error) {
      console.log(error);
    }
  }
}
