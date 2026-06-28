'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function getLoginEmail(input: string): string {
  if (input.includes('@')) return input.trim()
  const digits = input.replace(/\D/g, '')
  return `${digits}@gemma.internal`
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const email = getLoginEmail(identifier)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email/nomor WA atau password salah.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-background-page flex items-center justify-center p-4">
      <div className="bg-background-card border border-border-default rounded-xl shadow-sm w-full max-w-sm p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary mb-4">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h1 className="h1 text-text-primary">GEMMA</h1>
          <p className="small text-text-secondary mt-1">Ibnu Katsir</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Input Email / Nomor WA */}
          <div>
            <label className="small font-medium text-text-primary block mb-1.5">
              Email atau Nomor WhatsApp
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@gemma.com atau 081234567890"
              required
              className="w-full border border-border-default rounded-lg px-3 py-2.5 text-sm
                         text-text-primary bg-background-card
                         placeholder:text-text-placeholder
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         disabled:text-text-disabled disabled:bg-background-page"
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="small font-medium text-text-primary block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full border border-border-default rounded-lg px-3 py-2.5 text-sm
                         text-text-primary bg-background-card
                         placeholder:text-text-placeholder
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         disabled:text-text-disabled disabled:bg-background-page"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="small text-error bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60
                       text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

        </form>

        <div className="text-center mt-6">
          <Link
            href="/lupa-password"
            className="caption text-primary hover:text-primary-dark"
          >
            Lupa password?
          </Link>
        </div>

      </div>
    </main>
  )
}