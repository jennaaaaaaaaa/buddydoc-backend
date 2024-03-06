import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ChatService } from './chat.service';
// import { ChatDto } from './dto/chat.dto';
import { MessageDto } from './dto/message.dto';
import { HttpExceptionFilter } from 'src/common/http-exception.filter';
import { JwtAuthGuard, OptionalJwtAuthGuard } from 'src/auth/oauth/auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  //채팅방 목록
  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  async getRoom(@Res() res: Response, @Req() req: Request) {
    try {
      const userId = req.user['id'];
      const rooms = await this.chatService.getRoom(userId);
      return res.status(200).json(rooms);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

// /**
//  * 채팅메세지 create
//  * @param postId
//  * @param messageDto
//  * @returns
//  */
// @Post(':postId')
// @UseFilters(HttpExceptionFilter)
// async createMessage(@Param('postId') postId: number, @Body() messageDto: MessageDto) {
//   // //사용자 인증jwt에 들어있는 userName사용??...
//   try {
//     // const userId = 1;
//     const chat = await this.chatService.createMessage(messageDto);
//     return chat;
//   } catch (error) {
//     console.log(error);
//     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
//   }
// }

// //메세지 조회
// @Get(':postId')
// async getMessagesByPostId(@Param('postId') postId: number, @Query('lastMessageId') lastMessageId?: number) {
//   console.log('lastMessageId', lastMessageId); // 로그 출력
//   const messages = await this.chatService.getMessagesByPostId(postId, +lastMessageId);
//   return messages;
// }

//채팅방목록

// 소켓 서버를 구현할 때 별도의 컨트롤러 파일이 필요하지는 않습니다. 컨트롤러는 주로 HTTP 요청을 처리하는데 사용되며, 소켓 서버는 별도의 게이트웨이 클래스에서 처리됩니다.
