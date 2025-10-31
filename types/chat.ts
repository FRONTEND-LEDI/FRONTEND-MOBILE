export enum MessageType {
  USER = 'human',
  AI = 'ai'
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatResponse {
  output: string;
}

export interface MemoryMessage {
  type: string;
  content: string;
}

export interface Memory {
  idSession: string;
  messages: MemoryMessage[];
}