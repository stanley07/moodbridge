import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!;
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Example voice ID (Rachel)

export async function fetchSpeechFromText(text: string): Promise<Blob> {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    },
    {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      responseType: 'blob',
    }
  );
  return response.data;
}
