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
  UseFilters,
} from '@nestjs/common';
import { ChatService } from './chat.service';
// import { ChatDto } from './dto/chat.dto';
import { MessageDto } from './dto/message.dto';
import { HttpExceptionFilter } from 'src/common/http-exception.filter';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
  async getMessagesByPostId(@Param('postId') postId: number, @Query('lastMessageId') lastMessageId?: number) {
    console.log('lastMessageId', lastMessageId); // 로그 출력
    const messages = await this.chatService.getMessagesByPostId(postId, +lastMessageId);
    return messages;
  }
}

// 소켓 서버를 구현할 때 별도의 컨트롤러 파일이 필요하지는 않습니다. 컨트롤러는 주로 HTTP 요청을 처리하는데 사용되며, 소켓 서버는 별도의 게이트웨이 클래스에서 처리됩니다.
