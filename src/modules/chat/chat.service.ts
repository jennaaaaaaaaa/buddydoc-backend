import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
// import { ChatDto } from './dto/chat.dto';
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
        ...messageDto,
        createdAt: new Date(),
      },
    });
    return chat;
  }

  async getMessages(postId: number) {
    const message = await this.prisma.chats.findMany({
      where: { postId: +postId },
      // orderBy: {
      //   createdAt: 'asc',
      // },
    });
    return message;
  }

  async getUserInfo(userId: number) {
    const chat = await this.prisma.users.findUnique({
      where: { userId },
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
