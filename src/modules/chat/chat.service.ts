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

  // async getMessages(postId: number, page: number, pageSize: number) {
  //   const messages = await this.prisma.chats.findMany({
  //     where: { postId: postId },
  //     skip: (page - 1) * pageSize,
  //     take: pageSize,
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //     select: {
  //       postId: true,
  //       userId: true,
  //       chat_message: true,
  //       createdAt: true,
  //     },
  //   });

  //   if (!messages || messages.length === 0) {
  //     throw new NotFoundException({ errorMessage: '메시지가 존재하지 않습니다.' });
  //   }

  //   return messages;
  // }
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
    console.log('userId ===>>>>>>: ', userId);
    const chat = await this.prisma.users.findUnique({
      where: { userId: +userId },
      select: { userId: true, userName: true, userNickname: true },
    });
    return chat;
  }

  // async existPost(postId: number) {
  //   const post = await this.prisma.posts.findUnique({ where: { postId }, include: { users: true } });
  //   if (!post || post.deletedAt !== null) {
  //     throw new NotFoundException({ errorMessage: '게시글이 존재하지 않습니다.' });
  //   }
  //   return post;
  // }

  // async findUser(userId: number) {
  //   const user = await this.prisma.users.findUnique({ where: { userId } });
  //   if (!user || user.deletedAt !== null) {
  //     throw new NotFoundException({ errorMessage: '존재하지 않는 유저입니다' });
  //   }
  //   return user;
  // }

  // async getChat(postId: number) {
  //   const chat = await this.prisma.chats.findFirst({
  //     where: { postId },
  //     select: {
  //       chatId: true,
  //       postId: true,
  //       createdAt: true,
  //       userId: true,
  //       users: true,
  //       posts_chats_postIdToposts: true,
  //       chat_message: true,
  //     },
  //   });
  //   return chat;
  // }

  // async getRoom(userId: number) {
  //   const chatRoom = await this.prisma.chats.findFirst({
  //     where: { userId },
  //     select: {
  //       postId: true,
  //       users: {
  //         select: {
  //           userId: true,
  //           userNickname: true,
  //           userName: true,
  //           position: true,
  //           gitURL: true,
  //           career: true,
  //         },
  //       },
  //     },
  //   });
  //   return chatRoom;
  // }
}
