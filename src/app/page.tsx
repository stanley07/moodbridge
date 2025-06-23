import ChatBox from '@/components/ChatBox';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-center">MoodBridge</h1>
        <ChatBox />
      </div>
      <footer className="mt-12 text-center">
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/boltBadge.png"
            alt="Built with Bolt.new"
            style={{ height: '40px', marginTop: '20px' }}
          />
        </a>
      </footer>
    </main>
  );
}
