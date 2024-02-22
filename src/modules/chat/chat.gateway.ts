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
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/message.dto';
// import { InfoService } from '../myinfo/info.service';
// import { InfoDto } from '../myinfo/dto/info.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
// import { ChatDto } from './dto/chat.dto';

@WebSocketGateway({
  namespace: 'chat', //namespace로 채널?분리, chat이랑 alram이랑 나눌수 있음
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly chatService: ChatService,
    private prismaService: PrismaService
    // private readonly infoService: InfoService
  ) {}

  afterInit(server: Server) {
    console.log('afterInit');
  }

  //연결 상태에 대한 모니터링
  public handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`${client.id} 소켓 연결`);
    // // 클라이언트의 요청 헤더에서 JWT를 추출합니다.
    // const token = client.handshake.headers['authorization']?.split(' ')[1];

    // if (!token) {
    //   console.log('No token provided');
    //   client.disconnect();
    //   return;
    // }

    // // JWT를 확인하여 사용자를 인증합니다.
    // try {
    //   const decodedToken = this.jwtService.verify(token);
    //   const userId = decodedToken.userId;

    //   // 클라이언트 객체에 userId를 저장하여, 후속 요청에서 사용자 인증을 수행하도록 합니다.
    //   client.userId = userId;
    // } catch (error) {
    //   console.log('Invalid token');
    //   client.disconnect();
    // }
  }

  public handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`${client.id} 소켓 연결 해제`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      // postId: string;
      messageDto: MessageDto;
      // token: string;
      // userId: number;
    }
  ) {
    // console.log('data', data);
    // console.log('client', client);
    try {
      //user는 나중에...jwt 검증 후 client.userId = userId;로 client userId 가져오기
      // console.log(client userId ) //출력해서 값 확인해보기
      const user = await this.chatService.getUserInfo(data.messageDto.userId); //client.userId
      console.log('useruseruseruseruseruser', user);
      const message = await this.chatService.createMessage(data.messageDto); //Number(data.postId), Number(data.userId)
      this.server
        .to(`postRoom-${message.postId}`)
        .emit('receive-message', { message: message.chat_message, userName: user.userName });
      console.log(`메시지 '${message.chat_message}'가 ${user.userName}에 의해 ${message.postId} 방에 전송됨`);
    } catch (error) {
      console.log('error', error);
    }
  }

  //<이부분은 영상보면서 필요한지 불필요한지 판단해야함(무한스크롤로 조회되게끔했는데 프론트에서 그냥 userId-massage로 창에 다 보여줄 수 있는지 확인)>
  //postId를 받아와서 특정 postId의 메세지들을 조회
  // @SubscribeMessage('getMessagesWithUser')
  // async handleGetMessagesWithUser(
  //   client: Socket,
  //   payload: { page: number; pageSize: number },
  // ) {
  //   const messages = await this.prismaService.getMessagesWithUser(
  //     payload.page,
  //     payload.pageSize,
  //   );
  //   this.server.emit('messagesWithUser', messages);
  // }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket()
    client: Socket,
    @MessageBody() data: { userId: number; postId: string }
  ) {
    client.join(`postRoom-${data.postId}`);
    //유저를 찾는 로직을 user service에서 가져와야함
    // const user = await this.prismaService.users.findUnique({
    //   where: { userId: payload.userId },
    // });
    console.log(`소켓 id: ${client.id}, ${data.postId} 방에 입장함`);
    this.server.to(`post-${data.postId}`).emit('message', {
      content: `User ${data.userId}가 들어왔습니다.`, //${user.userName}
      // users: user, //유저정보를 나타내는건데 위에서 유저 이름만 잘 표기해주면 없어도 되지 않는지
    });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket()
    client: Socket,
    @MessageBody() data: { userId: number; postId: string }
  ) {
    client.leave(`post-${data.postId}`);
    // const user = await this.prismaService.users.findUnique({
    //   where: { userId: payload.userId },
    // });
    console.log(`소켓 id: ${client.id}, ${data.postId} 방에서 나감`);
    this.server.to(`post-${data.postId}`).emit('message', {
      content: `User ${data.userId}이(가) 나갔습니다.`, //${user.userName}
      // users: user, //유저정보를 나타내는건데 위에서 유저 이름만 잘 표기해주면 없어도 되지 않는지
    });
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
