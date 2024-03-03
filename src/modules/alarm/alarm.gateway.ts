import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'alarm',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class AlarmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;
  private connectedUsers: Map<string, Socket> = new Map(); // userId와 Socket의 매핑을 저장하는 Map

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    //this.connectedUsers.set(client.id, client); // 테스트 구문
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // 연결이 끊긴 클라이언트를 매핑에서 제거
    this.connectedUsers.forEach((socket, userId) => {
      if (socket === client) {
        this.connectedUsers.delete(userId);
        console.log(`Removed userId: ${userId} from connectedUsers`);
      }
    });
  }

  // 클라이언트에서 userId를 통해 웹소켓 연결을 요청할 때 호출될 메서드
  @SubscribeMessage('buddydocConnect')
  connectWebSocketWithUserId(client: Socket, userId: any,message: any) {
    // 이미 연결된 userId가 있다면 연결을 끊고 새로운 연결을 설정
    console.log(`뭐가 들어오니? `,userId["userId"]);
    if (this.connectedUsers.has(userId)) {
      const existingClient = this.connectedUsers.get(userId);
      existingClient.disconnect(true); // 연결 끊기
      this.connectedUsers.delete(userId); // 매핑에서 제거
    }

    // userId와 클라이언트 소켓을 매핑에 추가
    this.connectedUsers.set(userId, client);

    console.log(`WebSocket connected with userId: ${userId}`);
  }

  // 특정 userId에게 메시지를 보내는 메서드
  sendMessageToUser(userId: string, message: any) {
    console.log(`넘겨받은 string : ${userId}, message = ${message}`);
    const client = this.connectedUsers.get(userId);
    console.log(`client >> `, client.id);
    if (client) {
      client.emit('message', message); // 해당 userId의 클라이언트에게 메시지 보내기
    } else {
      console.log(`사용자가 로그인중이지 않습니다. : ${userId}`);
    }
  }
}
