import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Namespace, Socket, Server } from 'socket.io';
import { MessageDto } from './dto/message.dto';
import { InfoService } from '../myinfo/info.service';
import { InfoDto } from '../myinfo/dto/info.dto';
// import { ChatDto } from './dto/chat.dto';

let createdRooms: string[] = []; //새로 만들어지는 채팅방

@WebSocketGateway(81, { namespace: 'chat', transports: ['websocket'], cors: true }) //namespace로 채널?분리 , websocket 방식만 사용
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly chatService: ChatService,
    private readonly infoService: InfoService
  ) {}

  //연결 상태에 대한 모니터링
  public handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`${client.id} 소켓 연결`);
  }
  public handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`${client.id} 소켓 연결 해제`);
  }
  afterInit(server) {
    console.log('afterInit');
  }
  // @SubscribeMessage('send-message')
  // async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() chatDto: ChatDto) {
  //   const { postId } = chatDto; // chatDto에서 postId 추출
  //   await this.chatService.addChat(chatDto, postId);
  //   socket.broadcast //특정 방에 있는 모든 클라이언트에게 메시지 전송
  //     .to(chatDto.postId.toString()) //특정 방 정보
  //     .emit('message', chatDto); //보낼 메시지
  //   return chatDto;
  // }

  @SubscribeMessage('join-room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { postId: string }) {
    client.join(data.postId);
    console.log(`소켓 ${client.id}가 ${data.postId} 방에 입장함`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { postId: string }) {
    client.leave(data.postId);
    console.log(`소켓 ${client.id}가 ${data.postId} 방에서 나감`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() //client: Socket,
    @MessageBody()
    data: {
      postId: string;
      messageDto: MessageDto;
      userId: number;
    }
  ) {
    try {
      const user = await this.chatService.getUserInfo(data.userId);
      console.log('user', user);
      const chat = await this.chatService.createMessage(data.messageDto, Number(data.postId));
      this.server
        .to(data.postId)
        .emit('receive-message', { message: data.messageDto.chat_message, userName: user.userName });
      console.log(`메시지 '${data.messageDto.chat_message}'가 ${user.userName}에 의해 ${data.postId} 방에 전송됨`);
    } catch (error) {
      console.log('JWT 검증 실패', error);
    }
  }

  // @SubscribeMessage('join-room')
  // async handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() chatDto: ChatDto) {
  //   const exists = createdRooms.find((createdRoom) => createdRoom === chatDto.postId.toString()); //방존재 여부
  //   if (!exists) {
  //     createdRooms.push(chatDto.postId.toString());
  //   }
  //   socket.join(chatDto.postId.toString()); //해당하는 방에 참가

  //   const previousChats = await this.chatService.getChat(chatDto.postId);
  //   socket.emit('previousChats', previousChats);

  //   const user = await this.chatService.findUser(chatDto.userId);
  //   const alertObj: ChatDto = {
  //     postId: chatDto.postId,
  //     userId: user.userId,
  //     userName: user.userName,
  //     chat_message: `${user.userName}님이 들어왔습니다.`, // userName 대신 userId 사용
  //     createdAt: new Date(),
  //   };
  //   await this.chatService.addChat(alertObj, chatDto.postId);
  //   socket.emit('alert', alertObj);
  //   socket.broadcast.to(chatDto.postId.toString()).emit('alert', alertObj);
  //   return { success: true, payload: chatDto.postId };
  // }

  // @SubscribeMessage('leave-room')
  // async handleLeaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() chatDto: ChatDto) {
  //   socket.leave(chatDto.postId.toString());

  //   const user = await this.chatService.findUser(chatDto.userId);

  //   const alertObj: ChatDto = {
  //     postId: chatDto.postId,
  //     userId: user.userId,
  //     userName: user.userName,
  //     chat_message: `${chatDto.userName}님이 나갔습니다.`,
  //     createdAt: new Date(),
  //   };
  //   await this.chatService.addChat(alertObj, chatDto.postId);
  //   socket.emit('alert', alertObj); // 자신에게 퇴장 메시지를 보냄
  //   socket.broadcast.to(chatDto.postId.toString()).emit('alert', alertObj); // 다른 클라이언트에게 퇴장 메시지를 보냄
  //   return { success: true };
  // }
}
