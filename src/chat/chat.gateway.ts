import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import {
  JoinRoomDto,
  LeaveRoomDto,
  SendMessageDto,
  TypingDto,
} from './dto/chat-message.dto';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket): void {
    client.emit('chat:connected', { socketId: client.id });
  }

  handleDisconnect(client: Socket): void {
    const changedRooms = this.chatService.removeSocketFromRooms(client.id);

    for (const room of changedRooms) {
      this.server.to(room.roomId).emit('chat:room-updated', room);
    }
  }

  @SubscribeMessage('chat:join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinRoomDto,
  ) {
    this.assertRoomId(body.roomId);

    await client.join(body.roomId);

    const room = this.chatService.joinRoom(client.id, body);
    this.server.to(body.roomId).emit('chat:room-updated', room);

    return room;
  }

  @SubscribeMessage('chat:leave')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: LeaveRoomDto,
  ) {
    this.assertRoomId(body.roomId);

    await client.leave(body.roomId);

    const room = this.chatService.leaveRoom(client.id, body.roomId);
    this.server.to(body.roomId).emit('chat:room-updated', room);

    return room;
  }

  @SubscribeMessage('chat:message')
  sendMessage(@MessageBody() body: SendMessageDto) {
    this.assertRoomId(body.roomId);

    const message = this.chatService.createMessage(body);
    this.server.to(body.roomId).emit('chat:message', message);

    return message;
  }

  @SubscribeMessage('chat:typing')
  typing(@MessageBody() body: TypingDto) {
    this.assertRoomId(body.roomId);

    const typingEvent = this.chatService.createTypingEvent(body);
    this.server.to(body.roomId).emit('chat:typing', typingEvent);

    return typingEvent;
  }

  private assertRoomId(roomId?: string): void {
    if (!roomId) {
      throw new WsException('roomId is required');
    }
  }
}
