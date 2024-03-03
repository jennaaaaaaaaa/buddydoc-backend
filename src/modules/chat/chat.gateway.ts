챗 게이트 웨이

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
import { JwtService } from '@nestjs/jwt';
// import { InfoService } from '../myinfo/info.service';
// import { InfoDto } from '../myinfo/dto/info.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PostService } from '../posts/posts.service';
// import { ChatDto } from './dto/chat.dto';

interface ExtendedSocket extends Socket {
  userId: string; // Socket 타입을 확장하여 userId 속성을 추가합니다.
}
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
    private jwtService: JwtService,
    private postService: PostService
    // private readonly prismaService: PrismaService
    // private readonly infoService: InfoService
  ) {}

  afterInit(server: Server) {
    // this.server.setMaxListeners(20); //이벤트리스너 늘리기(너무 많다는 에러가 떠서 )
    console.log('afterInit');
  }

  //연결 상태에 대한 모니터링
  public handleConnection(@ConnectedSocket() client: ExtendedSocket) {
    // 소켓 컨텍스트에서는 HTTP 요청 객체에 직접 접근할 수 없다 (req.user 사용 못함)
    // JWT를 확인하여 사용자를 인증합니다.
    try {
      console.log(`${client.id} 소켓 연결`);
      // // 클라이언트의 요청 헤더에서 JWT를 추출합니다.
      // const token = client.handshake.headers['authorization']?.split(' ')[1];

      // if (!token) {
      //   console.log('No token provided');
      //   client.disconnect();
      //   return;
      // }
      // const decodedToken = this.jwtService.verify(token);
      // const userId = decodedToken.userId;
      // client.userId = userId;
      // 클라이언트 객체에 userId를 저장하여, 후속 요청에서 사용자 인증을 수행하도록 합니다.
    } catch (error) {
      console.log('Error during socket connection:', error);
      client.disconnect();
    }
  }

  public handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`${client.id} 소켓 연결 해제`);
  }

  //메세지 보내기
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: ExtendedSocket, // Socket 타입 대신 확장한 ExtendedSocket 타입을 사용합니다.
    @MessageBody() messageDto: MessageDto
  ) {
    console.log('messageDto', messageDto);
    console.log('client.userId', client.userId); // client.userId를 출력하여 확인합니다.

    try {
      const user = await this.chatService.getUserInfo(Number(client.userId)); // messageDto.userId 대신 client.userId를 사용합니다.
      console.log('user:', user);

      const message = await this.chatService.createMessage(messageDto);
      this.server
        .to(`postRoom-${message.postId}`)
        .emit('send-message', { message: message.chat_message, userName: user.userName });

      console.log(`메시지 '${message.chat_message}'가 ${user.userName}에 의해 ${message.postId} 방에 전송됨`);
    } catch (error) {
      console.log('error', error);
    }
  }

  //메세지 보내기<유저jwt에서 안 가져온 버전>
  // @SubscribeMessage('send-message')
  // async handleSendMessage(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() messageDto: MessageDto
  //   // postId: string;
  //   // token: string;
  //   // userId: number;
  // ) {
  //   console.log('messageDto', messageDto);
  //   console.log('messageDto.userId', messageDto.userId);
  //   // console.log('client', client);
  //   try {
  //     //user는 나중에...jwt 검증 후 client.userId = userId;로 client userId 가져오기
  //     // console.log(client userId ) //출력해서 값 확인해보기
  //     const user = await this.chatService.getUserInfo(messageDto.userId); //client.userId
  //     console.log('useruseruseruseruseruser', user);
  //     const message = await this.chatService.createMessage(messageDto); //Number(data.postId), Number(data.userId)
  //     this.server
  //       .to(`postRoom-${message.postId}`)
  //       .emit('send-message', { message: message.chat_message, userName: user.userName });
  //     console.log(`메시지 '${message.chat_message}'가 ${user.userName}에 의해 ${message.postId} 방에 전송됨`);
  //   } catch (error) {
  //     console.log('error', error);
  //   }
  // }

  //postId를 받아와서 특정 postId의 메세지들을 조회
  @SubscribeMessage('read-Messages')
  async handleGetMessages(client: Socket, payload: { postId: number; lastMessageId?: number }) {
    const { postId, lastMessageId } = payload;
    const result = await this.chatService.getMessagesByPostId(postId, lastMessageId);
    console.log('resultresultresult=>>>', result);
    client.emit('read-Messages', result); //getMessages=> 클라이언트에서 발생시키는 이벤트
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket()
    client: ExtendedSocket,
    @MessageBody() postId: string //랜덤채팅방 같으면 userId가 아닌 userNickname을 받으면 될 듯 채팅방들어오기전에 userNickname입력하게끔
  ) {
    //해당 게시글에 참여하고 있는 유저인지 확인 아니면 해당 게시글에 참여하고 있는 유저가 아닙니다

    console.log('join-room');
    client.join(`postRoom-${postId}`);
    //유저를 찾는 로직을 user service에서 가져와야함
    // const user = await this.prismaService.users.findUnique({
    //   where: { userId: payload.userId },
    // });

    // const user = await this.chatService.getUserInfo(+client.userId); //user 콘솔 찍어보고 싶은데 토큰이 있어야함
    const user = await this.chatService.getUserInfo(27);
    console.log('useruseruseruseruser🎈🎈🎈', user);

    //게시글에 참여한 사람인지 확인 해야함
    const checkParticipated = await this.postService.getParticipantsInPost(+postId);
    console.log(checkParticipated); //콘솔로 값이 어떻게 나오는지 알아보고 checkParticipated안에 들어 있는 user
    // if()
    console.log(`소켓 id: ${client.id}, ${postId} 방에 입장함`);
    this.server.to(`post-${postId}`).emit('join-room', {
      content: `User ${client.userId}가 들어왔습니다.`, //${user.userName}
      // users: user, //유저정보를 나타내는건데 위에서 유저 이름만 잘 표기해주면 없어도 되지 않는지
    });
  }
  //유저 jwt 안가여온 버전
  // @SubscribeMessage('join-room')
  // handleJoinRoom(
  //   @ConnectedSocket()
  //   client: Socket,
  //   @MessageBody() data: { userId: number; postId: string } //랜덤채팅방 같으면 userId가 아닌 userNickname을 받으면 될 듯 채팅방들어오기전에 userNickname입력하게끔
  // ) {
  //   //해당 게시글에 참여하고 있는 유저인지 확인 아니면 해당 게시글에 참여하고 있는 유저가 아닙니다

  //   console.log('join-room');
  //   client.join(`postRoom-${data.postId}`);
  //   //유저를 찾는 로직을 user service에서 가져와야함
  //   // const user = await this.prismaService.users.findUnique({
  //   //   where: { userId: payload.userId },
  //   // });
  //   console.log(`소켓 id: ${client.id}, ${data.postId} 방에 입장함`);
  //   this.server.to(`post-${data.postId}`).emit('join-room', {
  //     content: `User ${data.userId}가 들어왔습니다.`, //${user.userName}
  //     // users: user, //유저정보를 나타내는건데 위에서 유저 이름만 잘 표기해주면 없어도 되지 않는지
  //   });
  // }

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
    this.server.to(`post-${data.postId}`).emit('leave-room', {
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
