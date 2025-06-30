// src/utils/groupMessagesByDate.ts
import { Message } from '@/types/Message';

export const groupMessagesByDate = (messages: Message[]) => {
  return messages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {} as { [date: string]: Message[] });
};
