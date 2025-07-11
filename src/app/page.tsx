'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import ChatBox from '@/components/ChatBox';
import Auth from '@/components/Auth';
import Image from 'next/image';
//import TavusVideo from '@/components/TavusVideo'; <TavusVideo />


export default function Home() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen p-4">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-center">MoodBridge</h1>
        <h3 className="text-4xl font-bold">Welcome to MoodBridge</h3>
        <p className="mt-4 text-lg">Bridging your emotions with intelligent care.</p>

        {session ? (
          <ChatBox user={session.user} />
          
        ) : (
          <div className="mt-6">
            <Auth />
          </div>
          
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-gray-300 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Built with ❤️ using Bolt.new, Supabase, OpenAI, and ElevenLabs
        </p>
        <a href="https://bolt.new" target="_blank" rel="noopener noreferrer">
          <Image
            src="/boltBadge.png"
            alt="Built with Bolt.new"
            width={140}
            height={40}
            className="mx-auto mt-3"
          />
        </a>
      </footer>
    </main>
  );
}
