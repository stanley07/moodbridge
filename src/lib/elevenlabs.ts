import axios from 'axios';

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Replace with your actual voice ID

export async function fetchSpeechFromText(text: string): Promise<Blob> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('Missing ElevenLabs API key');
  }

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    { text },
    {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      responseType: 'blob',
    }
  );

  return response.data;
}
