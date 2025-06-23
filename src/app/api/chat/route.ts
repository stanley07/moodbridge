// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const reply = completion.choices[0].message.content;

    return NextResponse.json({ reply });
    } catch (error: unknown) {
        console.error('OpenAI error:', error);
        if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
