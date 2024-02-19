import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
// import { ChatDto } from './dto/chat.dto';
import { MessageDto } from './dto/message.dto';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(messageDto: MessageDto, postId: number) {
    const post = await this.prisma.posts.findUnique({ where: { postId } });

    if (!post || post.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    const chat = await this.prisma.chats.create({
      data: {
        ...messageDto,
        postId: postId,
        userId: 1, //사용자인증
        createdAt: new Date(),
      },
    });
    return chat;
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
