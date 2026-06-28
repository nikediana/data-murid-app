'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'form' | 'success'

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>('form')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Gagal update password. Silakan minta link reset baru.')
      setLoading(false)
      return
    }

    setStep('success')
  }

  return (
    <main className="min-h-screen bg-background-page flex items-center justify-center p-4">
      <div className="bg-background-card border border-border-default rounded-xl
                      shadow-sm w-full max-w-sm p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14
                          rounded-xl bg-primary mb-4">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h1 className="h2 text-text-primary">Buat Password Baru</h1>
          <p className="small text-text-secondary mt-1">GEMMA Ibnu Katsir</p>
        </div>

        {/* Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="small font-medium text-text-primary block mb-1.5">
                Password Baru
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                className="w-full border border-border-default rounded-lg px-3 py-2.5
                           text-sm text-text-primary bg-background-card
                           placeholder:text-text-placeholder
                           focus:outline-none focus:ring-2 focus:ring-primary
                           focus:border-transparent"
              />
            </div>

            <div>
              <label className="small font-medium text-text-primary block mb-1.5">
                Ulangi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru"
                required
                className="w-full border border-border-default rounded-lg px-3 py-2.5
                           text-sm text-text-primary bg-background-card
                           placeholder:text-text-placeholder
                           focus:outline-none focus:ring-2 focus:ring-primary
                           focus:border-transparent"
              />
            </div>

            {error && (
              <p className="small text-error bg-red-50 border border-red-200
                            rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60
                         text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="h3 text-text-primary">Password berhasil diubah</h2>
            <p className="small text-text-secondary">
              Silakan login dengan password baru kamu.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-primary hover:bg-primary-dark text-white
                         font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Masuk Sekarang
            </button>
          </div>
        )}

      </div>
    </main>
  )
}