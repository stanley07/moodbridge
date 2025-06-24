// src/components/Auth.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      alert('Error sending login link: ' + error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">Login to MoodBridge</h2>
      {sent ? (
        <p className="text-green-600">Check your email for a login link</p>
      ) : (
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
            Send Magic Link
          </button>
        </form>
      )}
    </div>
  )
}
