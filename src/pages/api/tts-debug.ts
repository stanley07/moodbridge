// /src/pages/api/tts-debug.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  const text = "Hello! This is a test from ElevenLabs.";

  try {
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Replace with your default voice ID if needed

    console.log('[TTS] Using API Key:', apiKey);
    console.log('[TTS] Voice ID:', voiceId);

    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey || '',
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.7,
        },
      }),
    });

    if (!elevenRes.ok) {
      const errorText = await elevenRes.text();
      return res.status(500).json({ error: `ElevenLabs failed: ${errorText}` });
    }

    const audioBuffer = await elevenRes.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', Buffer.byteLength(audioBuffer));
    res.send(Buffer.from(audioBuffer));
  } catch (err: any) {
    console.error('[TTS ERROR]', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
