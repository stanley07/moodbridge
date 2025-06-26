// ChatBox.tsx - Refactored and Type-Safe
'use client';

import React, {
  useState,
  useRef,
  useEffect,
  FormEvent,
  ChangeEvent,
} from 'react';
import { fetchSpeechFromText } from '@/lib/elevenlabs';
import { logChat } from '@/lib/logChat';
import { supabase } from '@/lib/supabaseClient';
import Sentiment from 'sentiment';


// 👇 This creates a custom type if it's missing in the current TypeScript context
type SpeechRecognition =
  typeof window extends { SpeechRecognition: infer T }
    ? T extends new () => infer R
      ? R
      : never
    : never;

    declare global {
      interface Window {
        webkitSpeechRecognition: typeof SpeechRecognitionConstructor;
        SpeechRecognition: typeof SpeechRecognitionConstructor;
      }
    
      var SpeechRecognitionConstructor: {
        new (): ISpeechRecognition;
        prototype: ISpeechRecognition;
      };
    }
    
    interface ISpeechRecognition extends EventTarget {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onresult: ((event: SpeechRecognitionEventLike) => void) | null;
      onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
      start(): void;
      stop(): void;
      abort(): void;
    }
    

    
    
  

// ✅ SpeechRecognition Type Fix
type SpeechRecognitionType = typeof window extends {
  webkitSpeechRecognition: infer T;
}
  ? T
  : never;

interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: {
      0: { transcript: string };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

const getSpeechRecognition = (): SpeechRecognitionType | undefined => {
  if (typeof window === 'undefined') return undefined;
  return (window.SpeechRecognition || window.webkitSpeechRecognition) as SpeechRecognitionType;
};

type Message = {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sentiment?: string;
};

type ChatBoxProps = {
  user: { id: string };
};

export default function ChatBox({ user }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);  

  const sentimentAnalyzer = new Sentiment();

  useEffect(() => {
    const RecognitionClass =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  if (RecognitionClass) {
    const recognition = new RecognitionClass();
    recognitionRef.current = recognition;
  }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch messages:', error);
        setError('Failed to load messages.');
      } else if (data) {
        const formatted: Message[] = data.map((entry: {
          sender: 'user' | 'assistant';
          message: string;
          created_at: string;
        }) => ({
          sender: entry.sender,
          text: entry.message,
          timestamp: new Date(entry.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        setMessages(formatted);
      }
    };

    fetchMessages();
  }, [user.id]);

  const getSentimentLabel = (score: number): string => {
    if (score > 1) return '😊 Positive';
    if (score < -1) return '😞 Negative';
    return '😐 Neutral';
  };

  const sendMessage = async (userMessage: string): Promise<void> => {
    setError(null);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text: userMessage, timestamp }]);
    await logChat(userMessage, 'user', user.id);

    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      const reply = data.reply;
      const sentimentScore = sentimentAnalyzer.analyze(reply).score;
      const sentiment = getSentimentLabel(sentimentScore);
      const replyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: reply, timestamp: replyTimestamp, sentiment },
      ]);
      await logChat(reply, 'assistant', user.id);

      const audioBlob = await fetchSpeechFromText(reply);
      const audioUrl = URL.createObjectURL(audioBlob);
      new Audio(audioUrl).play();
    } catch (err) {
      console.error('Failed to respond:', err);
      setError('Something went wrong while processing your request.');
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = (): void => {
    const SR = getSpeechRecognition();
    if (!SR) {
      alert('SpeechRecognition not supported in this browser');
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort(); // Abort any ongoing recognition
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0][0].transcript;
      setInput('');
      sendMessage(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setError('Voice recognition error occurred.');
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setError('Unable to start voice input.');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  const exportChat = (): void => {
    const content = messages
      .map(
        msg =>
          `${msg.timestamp} - ${msg.sender === 'user' ? 'You' : 'MoodBridge'}: ${msg.text}`
      )
      .join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `moodbridge_chat_${new Date().toISOString()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="bg-white text-black dark:bg-gray-800 dark:text-white">
        <button
            onClick={() => {
              const newMode = !darkMode;
              console.log('Toggling mode:', newMode); // 🔍 Debug

              if (newMode) {
                document.documentElement.classList.add('dark');
                console.log('✅ Added .dark to <html>');
              } else {
                document.documentElement.classList.remove('dark');
                console.log('🟡 Removed .dark from <html>');
              }

              setDarkMode(newMode);
              console.log('Current classList:', document.documentElement.classList.value); // 🔍 Check state
            }}
            className="text-sm underline mr-4"
          >
            Toggle {darkMode ? 'Light' : 'Dark'} Mode
          </button>



        <button onClick={exportChat} className="text-blue-400 underline text-sm">
          Export Chat (.txt)
        </button>
      </div>

      <div className="p-4 max-w-xl mx-auto">
        <div className="border p-4 rounded h-96 overflow-y-auto bg-white text-black mb-4 dark:bg-gray-800 dark:text-white">
          {messages.map((msg, i) => (
            <div key={i} className="mb-3 whitespace-pre-line">
              <strong className="block">{msg.sender === 'user' ? '🧑 You' : '🤖 MoodBridge'}</strong>
              <span>{msg.timestamp} — {msg.text}</span>
              {msg.sender === 'assistant' && msg.sentiment && (
                <div className="text-sm text-gray-500 mt-1 italic">{msg.sentiment}</div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="mb-2 text-gray-500 italic">MoodBridge is typing...</div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1"
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            placeholder="Ask MoodBridge..."
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
            Send
          </button>
          <button
            type="button"
            className={`px-4 py-1 rounded ${isListening ? 'bg-red-600' : 'bg-green-600'} text-white`}
            onClick={startListening}
            disabled={isListening}
          >
            🎙️ {isListening ? 'Listening...' : 'Speak'}
          </button>
        </form>
      </div>
    </div>
  );
}
