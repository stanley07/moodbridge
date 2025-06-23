import ChatBox from '@/components/ChatBox';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-center">MoodBridge</h1>
        <h3 className="text-4xl font-bold">Welcome to MoodBridge</h3>
        <p className="mt-4 text-lg">Bridging your emotions with intelligent care.</p>
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
