import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { MessageDto } from './dto/message.dto';
// import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 채팅 create
   * @param messageDto
   * @param postId
   * @returns
   */
  async createMessage(messageDto: MessageDto) {
    //postId: number, userId: number
    const user = await this.prisma.users.findUnique({ where: { userId: +messageDto.userId } });

    //다시 로그인하게끔
    if (!user || user.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '유저가 존재하지 않습니다.' });
    }

    const post = await this.prisma.posts.findUnique({ where: { postId: +messageDto.postId } });

    if (!post || post.deletedAt !== null) {
    }

    const chat = await this.prisma.chats.create({
      data: {
        postId: +messageDto.postId,
        userId: +messageDto.userId,
        chat_message: messageDto.chat_message,
        createdAt: new Date(),
      },
    });
    return chat;
  }

  async getMessagesByPostId(postId: number, lastMessageId?: number) {
    let whereCondition: Prisma.chatsWhereInput = { postId: +postId };

    if (lastMessageId) {
      whereCondition = {
        ...whereCondition,
        chatId: {
          lt: +lastMessageId,
        },
      };
    }

    const messages = await this.prisma.chats.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        chatId: true,
        chat_message: true,
        createdAt: true,
        userId: true,
        users: {
          select: {
            userNickname: true,
            profileImage: true,
          },
        },
      },
    });

    const isLastPage = messages.length < 10;

    return {
      messages,
      isLastPage,
    };
  }

  //임시로 유저 조회, 찾아본 바로는 원래는 클라이언트에서 토큰을 받아서?? 인증을 해야한다고함
  async getUserInfo(userId: number) {
    // console.log('userId ===>>>>>>: ', userId);
    const chat = await this.prisma.users.findUnique({
      where: { userId: +userId },
      select: { userId: true, userNickname: true, profileImage: true },
    });
    return chat;
  }

  //되는거 확인
  async getUserCheckInPostId(postId: number) {
    console.log('서비스', postId);
    const post = await this.prisma.notifications.findMany({
      where: { postId: +postId, notiStatus: 'accept' },
      select: { noti_userId: true },
    });
    console.log('서비스', post);

    return post;
  }

  //되는거 확인
  async checkExistAuthor(postId: number) {
    console.log('checkAboutPost_users');
    const author = await this.prisma.posts.findUnique({ where: { postId: +postId }, select: { post_userId: true } });
    console.log('서비스 author', author);
    return author;
  }

  //채팅방목록
  async getRoom(userId: number) {
    const rooms = await this.prisma.notifications.findMany({
      where: { OR: [{ noti_userId: userId }, { userId: userId }], notiStatus: 'accept' },
      select: {
        postId: true,
        posts: {
          select: {
            postTitle: true,
            postType: true,
            memberCount: true,
          },
        },
      },
    });

    return rooms;
  }
}
