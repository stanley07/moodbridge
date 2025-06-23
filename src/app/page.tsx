import ChatBox from '@/components/ChatBox';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">MoodBridge</h1>
      <ChatBox />
    </main>
  );
}
