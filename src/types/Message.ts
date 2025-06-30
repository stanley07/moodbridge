export type Message = {
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
    sentiment?: string;
  };
  
  export type GroupedMessages = {
    [date: string]: Message[];
  };
  