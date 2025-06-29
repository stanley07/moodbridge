import axios from 'axios';

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export async function fetchSpeechFromText(text: string): Promise<Blob> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error("❌ Missing ElevenLabs API key");
    throw new Error('Missing ElevenLabs API key');
  }

  try {
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

    console.log("✅ ElevenLabs audio response OK");
    return response.data;
  } catch (error: any) {
    console.error("❌ ElevenLabs API call failed:", error.response?.data || error.message);
    throw new Error('Failed to fetch speech from ElevenLabs');
  }
}
