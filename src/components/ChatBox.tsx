'use client';

import React, { useState, useRef, useEffect } from 'react';
import { fetchSpeechFromText } from '@/lib/elevenlabs';
import { logChat } from '@/lib/logChat';
import { supabase } from '@/lib/supabaseClient';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

type Message = {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
};

export default function ChatBox({ user }: { user: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = useState(false);

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

  const sendMessage = async (userMessage: string) => {
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
      const replyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: reply, timestamp: replyTimestamp },
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

  const startListening = () => {
    if (!SpeechRecognition) return alert('SpeechRecognition not supported in this browser');
    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput('');
      sendMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setError('Voice recognition error occurred.');
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  const exportChat = () => {
    const content = messages
      .map(
        msg =>
          `${msg.timestamp} - ${msg.sender === 'user' ? 'You' : 'MoodBridge'}: ${msg.text}`
      )
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `moodbridge_chat_${new Date().toISOString()}.txt`;
    link.click();
  };

  return (
    <div>
      <div className="text-right mb-2">
        <button onClick={exportChat} className="text-blue-600 underline text-sm">
          Export Chat (.txt)
        </button>
      </div>

      <div className="p-4 max-w-xl mx-auto">
        <div className="border p-4 rounded h-96 overflow-y-auto bg-white mb-4">
          {messages.map((msg, i) => (
            <div key={i} className="mb-2 whitespace-pre-line">
              {msg.timestamp} - {msg.sender === 'user' ? 'You' : 'MoodBridge'}: {msg.text}
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
            onChange={e => setInput(e.target.value)}
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
