'use client';

import { useState } from 'react';
import { createTavusVideo } from '@/lib/tavusClient';

export default function TavusVideo() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('Stanley');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await createTavusVideo('your_template_id', { name });
      const playbackUrl = result?.data?.video_url || result?.video_url;
      setVideoUrl(playbackUrl);
    } catch (error) {
      console.error('Video generation failed:', error);
      alert('Failed to generate video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Generate Personalized Video</h2>
      <input
        type="text"
        value={name}
        placeholder="Enter your name"
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Generating...' : 'Generate Video'}
      </button>

      {videoUrl && (
        <div className="mt-4">
          <video controls width="100%">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
