// ChatBox.tsx - With Foldable Chat by Date
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

// ✅ Native browser SpeechRecognition
const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return undefined;
  return (window.SpeechRecognition || window.webkitSpeechRecognition);
};

// ✅ Group messages by date
function groupMessagesByDate(messages: Message[]) {
  return messages.reduce((groups: Record<string, Message[]>, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sentiment?: string;
}

interface ChatBoxProps {
  user: { id: string };
}

export default function ChatBox({ user }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sentimentAnalyzer = new Sentiment();

  useEffect(() => {
    const RecognitionClass = getSpeechRecognition();
    if (RecognitionClass) {
      recognitionRef.current = new RecognitionClass();
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
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
        const formatted: Message[] = data.map((entry: any) => ({
          sender: entry.sender,
          text: entry.message,
          timestamp: new Date(entry.created_at).toISOString(),
        }));
        setMessages(formatted);
      }
    };

    fetchMessages();
  }, [user.id]);

  const toggleDate = (date: string) => {
    setCollapsedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const getSentimentLabel = (score: number): string => {
    if (score > 1) return '😊 Positive';
    if (score < -1) return '😞 Negative';
    return '😐 Neutral';
  };

  const sendMessage = async (userMessage: string) => {
    setError(null);
    const timestamp = new Date().toISOString();
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

      try {
        const blob = await fetchSpeechFromText(reply);
        const audioUrl = URL.createObjectURL(blob);
        new Audio(audioUrl).play();
      } catch (ttsError) {
        console.error('TTS error:', ttsError);
      }

      const sentimentScore = sentimentAnalyzer.analyze(reply).score;
      const sentiment = getSentimentLabel(sentimentScore);
      const replyTimestamp = new Date().toISOString();

      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: reply, timestamp: replyTimestamp, sentiment },
      ]);
      await logChat(reply, 'assistant', user.id);
    } catch (err) {
      console.error('Failed to respond:', err);
      setError('Something went wrong. Try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      alert('SpeechRecognition not supported');
      return;
    }

    if (recognitionRef.current) recognitionRef.current.abort();

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput('');
      sendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError('Voice recognition error occurred.');
    };

    recognition.start();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  const exportChat = () => {
    const content = messages.map(
      m => `${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${m.sender === 'user' ? 'You' : 'MoodBridge'}: ${m.text}`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `moodbridge_chat_${new Date().toISOString()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="bg-white text-black dark:bg-gray-800 dark:text-white px-4 py-2">
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className="text-sm underline mr-4"
        >
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
        <button onClick={exportChat} className="text-blue-400 underline text-sm">
          Export Chat (.txt)
        </button>
      </div>

      <div className="p-4 max-w-xl mx-auto">
        <div className="border p-4 rounded h-[450px] overflow-y-auto bg-white text-black mb-4 dark:bg-gray-800 dark:text-white">
          {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
            <div key={date} className="mb-4">
              <h4
                onClick={() => toggleDate(date)}
                className="font-semibold text-sm mb-2 cursor-pointer text-blue-500"
              >
                {collapsedDates[date] ? '▶' : '▼'} {date}
              </h4>
              {!collapsedDates[date] && (
                <div>
                  {msgs.map((msg, i) => (
                    <div key={i} className="mb-3 whitespace-pre-line">
                      <strong className="block">{msg.sender === 'user' ? '🧑 You' : '🤖 MoodBridge'}</strong>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {msg.text}</span>
                      {msg.sentiment && (
                        <div className="text-sm text-gray-500 mt-1 italic">{msg.sentiment}</div>
                      )}
                    </div>
                  ))}
                </div>
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
