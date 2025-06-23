'use client';

import React, { useState } from 'react';

export default function ChatBox() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, `You: ${userMessage}`]);
    setInput('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    setMessages(prev => [...prev, `MoodBridge: ${data.reply}`]);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="border p-4 rounded h-96 overflow-y-auto bg-white mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">{msg}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
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
      </form>
    </div>
  );
}
