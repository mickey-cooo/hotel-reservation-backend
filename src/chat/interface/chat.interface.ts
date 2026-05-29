export interface ChatUser {
  socketId: string;
  userId: string;
  displayName?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  displayName?: string;
  message: string;
  createdAt: Date;
}

export interface ChatRoomSnapshot {
  roomId: string;
  users: ChatUser[];
  messages: ChatMessage[];
}

export interface ChatTypingEvent {
  roomId: string;
  userId: string;
  isTyping: boolean;
}
