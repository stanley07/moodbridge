export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6">
      <div>
        <h1 className="text-4xl font-bold">Welcome to MoodBridge</h1>
        <p className="mt-4 text-lg">Bridging your emotions with intelligent care.</p>
        {/* Your other content */}
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
