import { Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { NotiDto } from './dto/noti.dto';

@Injectable()
export class NotiService {
  constructor(private prisma: PrismaService) {}

  async sendNotification(notiDto: NotiDto) {
    try {

    } catch (error) {
      console.log(error);
    }
  }

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
