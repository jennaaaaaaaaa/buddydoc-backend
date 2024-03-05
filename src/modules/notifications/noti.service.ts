import { ForbiddenException, Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { NotiDto } from './dto/noti.dto';

@Injectable()
export class NotiService {
  constructor(private prisma: PrismaService) {}

  /**
   * 신청보내기
   * @param notiDto
   */
  async sendNotification(notiDto: NotiDto) {
    try {
      const { userId, postId, noti_userId, noti_message, notiStatus, position } = notiDto;
      const result = await this.prisma.notifications.create({
        data: {
          userId: userId,
          postId: postId,
          noti_userId: noti_userId,
          noti_message: noti_message,
          notiStatus: notiStatus,
          position: position,
          createdAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      console.log(error);
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
