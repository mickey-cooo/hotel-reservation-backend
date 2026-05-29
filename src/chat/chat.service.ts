import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ChatMessage,
  ChatRoomSnapshot,
  ChatTypingEvent,
  ChatUser,
} from './interface/chat.interface';
import { JoinRoomDto, SendMessageDto, TypingDto } from './dto/chat-message.dto';

interface ChatRoomState {
  users: Map<string, ChatUser>;
  messages: ChatMessage[];
}

@Injectable()
export class ChatService {
  private readonly rooms = new Map<string, ChatRoomState>();

  joinRoom(socketId: string, body: JoinRoomDto): ChatRoomSnapshot {
    const room = this.getOrCreateRoom(body.roomId);

    room.users.set(socketId, {
      socketId,
      userId: body.userId,
      displayName: body.displayName,
    });

    return this.getRoomSnapshot(body.roomId);
  }

  leaveRoom(socketId: string, roomId: string): ChatRoomSnapshot {
    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        roomId,
        users: [],
        messages: [],
      };
    }

    room.users.delete(socketId);

    if (room.users.size === 0 && room.messages.length === 0) {
      this.rooms.delete(roomId);
    }

    return this.getRoomSnapshot(roomId);
  }

  removeSocketFromRooms(socketId: string): ChatRoomSnapshot[] {
    const changedRooms: ChatRoomSnapshot[] = [];

    for (const [roomId, room] of this.rooms.entries()) {
      if (!room.users.has(socketId)) {
        continue;
      }

      room.users.delete(socketId);
      changedRooms.push(this.getRoomSnapshot(roomId));
    }

    return changedRooms;
  }

  createMessage(body: SendMessageDto): ChatMessage {
    const room = this.getOrCreateRoom(body.roomId);
    const message: ChatMessage = {
      id: randomUUID(),
      roomId: body.roomId,
      userId: body.userId,
      displayName: body.displayName,
      message: body.message,
      createdAt: new Date(),
    };

    room.messages.push(message);

    return message;
  }

  createTypingEvent(body: TypingDto): ChatTypingEvent {
    return {
      roomId: body.roomId,
      userId: body.userId,
      isTyping: body.isTyping,
    };
  }

  getRoomSnapshot(roomId: string): ChatRoomSnapshot {
    const room = this.getOrCreateRoom(roomId);

    return {
      roomId,
      users: Array.from(room.users.values()),
      messages: [...room.messages],
    };
  }

  private getOrCreateRoom(roomId: string): ChatRoomState {
    const existingRoom = this.rooms.get(roomId);

    if (existingRoom) {
      return existingRoom;
    }

    const newRoom: ChatRoomState = {
      users: new Map<string, ChatUser>(),
      messages: [],
    };

    this.rooms.set(roomId, newRoom);

    return newRoom;
  }
}
