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
  UseFilters,
} from '@nestjs/common';
import { ChatService } from './chat.service';
// import { ChatDto } from './dto/chat.dto';
import { MessageDto } from './dto/message.dto';
import { HttpExceptionFilter } from 'src/common/http-exception.filter';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  //본인이 참가한 채팅방 조회??

  // //
  // @Get(':postId')
  // async getChat(@Param('postId') postId: number) {
  //   return await this.chatService.getChat(postId);
  // }

  //채팅방별로 채팅 메세지 조회
  // @Get(':postId')

  /**
   * 채팅메세지 create
   * @param postId
   * @param messageDto
   * @returns
   */
  @Post(':postId')
  @UseFilters(HttpExceptionFilter)
  async createMessage(@Param('postId') postId: number, @Body() messageDto: MessageDto) {
    // //사용자 인증jwt에 들어있는 userName사용??...
    try {
      const userId = 1;
      const chat = await this.chatService.createMessage(messageDto);
      return chat;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  //메세지 조회//아닌거 같은데
  @Get(':postId')
  async getMessages(@Param('postId') postId: number) {
    return this.chatService.getMessages(postId);
  }
}
