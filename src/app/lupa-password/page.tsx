'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Step = 'pilih_tipe' | 'guru' | 'form_email' | 'cek_email'

export default function LupaPasswordPage() {
  const [step, setStep] = useState<Step>('pilih_tipe')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsExpired(params.get('expired') === '1')
  }, [])

  async function handleKirimReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    // Selalu tampilkan layar cek email — tidak expose apakah email terdaftar atau tidak
    setLoading(false)
    setStep('cek_email')
  }

  async function handleKirimUlang() {
    if (!email) return
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
  }

  return (
    <main className="min-h-screen bg-background-page flex items-center justify-center p-4">
      <div className="bg-background-card border border-border-default rounded-xl
                      shadow-sm w-full max-w-sm p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14
                          rounded-xl bg-primary mb-4">
            <span className="text-white font-bold text-xl">G</span>
          </div>
        </div>

        {/* ── STEP: Pilih Tipe ── */}
        {step === 'pilih_tipe' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h1 className="h2 text-text-primary">Lupa Password</h1>
              <p className="small text-text-secondary">
                Pilih jenis akun Anda.
              </p>
            </div>

            {isExpired && (
              <div className="small text-warning bg-yellow-50 border border-yellow-200
                              rounded-lg px-3 py-2 text-center">
                ⚠️ Link sebelumnya sudah kadaluarsa. Silakan minta link baru.
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => setStep('guru')}
                className="w-full flex items-center gap-3 border border-border-default
                           rounded-lg px-4 py-3.5 text-left hover:bg-background-page
                           transition-colors"
              >
                <span className="text-2xl">👨‍🏫</span>
                <span className="text-sm font-medium text-text-primary">Guru</span>
              </button>

              <button
                onClick={() => setStep('form_email')}
                className="w-full flex items-center gap-3 border border-border-default
                           rounded-lg px-4 py-3.5 text-left hover:bg-background-page
                           transition-colors"
              >
                <span className="text-2xl">🏢</span>
                <span className="text-sm font-medium text-text-primary">
                  Admin / Akademik / Bendahara
                </span>
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="caption text-primary hover:text-primary-dark"
              >
                ← Kembali ke Login
              </Link>
            </div>
          </div>
        )}

        {/* ── STEP: Guru ── */}
        {step === 'guru' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h1 className="h2 text-text-primary">Reset Password Guru</h1>
            </div>

            <div className="text-center space-y-3">
              <p className="small text-text-secondary leading-relaxed">
                Password akun Guru hanya dapat direset oleh petugas.
              </p>
              <p className="small text-text-secondary leading-relaxed">
                Silakan hubungi PJ Aplikasi GEMMA untuk mengatur ulang password.
              </p>
            </div>

            <Link
              href="/login"
              className="block w-full bg-primary hover:bg-primary-dark text-white
                         font-semibold py-2.5 rounded-lg transition-colors text-sm text-center"
            >
              Kembali ke Login
            </Link>
          </div>
        )}

        {/* ── STEP: Form Email ── */}
        {step === 'form_email' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h1 className="h2 text-text-primary">Reset Password</h1>
              <p className="small text-text-secondary leading-relaxed">
                Masukkan email yang digunakan untuk login.
              </p>
            </div>

            <form onSubmit={handleKirimReset} className="space-y-4">
              <div>
                <label className="small font-medium text-text-primary block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
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
                disabled={loading || !email}
                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60
                           text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setStep('pilih_tipe')}
                className="caption text-primary hover:text-primary-dark"
              >
                ← Kembali
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Cek Email ── */}
        {step === 'cek_email' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h1 className="h2 text-text-primary">Cek Email Anda</h1>
            </div>

            <div className="text-center space-y-3">
              <p className="small text-text-secondary leading-relaxed">
                Jika email Anda terdaftar, kami telah mengirimkan tautan
                untuk mengatur ulang password.
              </p>
              <p className="small text-text-secondary leading-relaxed">
                Silakan periksa inbox atau folder spam Anda, lalu cari email
                dari <span className="font-medium text-text-primary">Supabase</span>{' '}
                (Sistem Keamanan Kami).
              </p>
            </div>

            <div className="text-center space-y-3">
              <p className="caption text-text-secondary">
                Belum menerima email?{' '}
                <button
                  onClick={handleKirimUlang}
                  className="text-primary hover:text-primary-dark font-medium cursor-pointer"
                >
                  Kirim Ulang
                </button>
              </p>

              <Link
                href="/login"
                className="block w-full border border-border-default text-text-secondary
                           hover:bg-background-page font-medium py-2.5 rounded-lg
                           transition-colors text-sm text-center"
              >
                Kembali ke Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}