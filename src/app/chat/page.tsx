'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Failed to fetch response.' }]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="p-4 bg-blue-600 text-white text-center text-xl font-semibold">
        MoodBridge Chat
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 p-3 rounded ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-200'}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="p-4 flex border-t">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 mr-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="How are you feeling today?"
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
