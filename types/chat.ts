type MessageType = 'human' | 'ai';
export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  isError?: boolean;
  isUser?: boolean;

}

export interface ChatResponse {
  output?: string;
  text?: string;
  message?: string;
  reply?: string;
  content?: string;
  response?: string;
}

export interface MemoryMessage {
  type: string;
  content: string;
  timestamp?: Date;
}

export interface Memory {
  idSession: string;
  messages: MemoryMessage[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}