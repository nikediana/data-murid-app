import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

const roleLabel: Record<string, string> = {
  guru: 'Guru',
  akademik: 'Akademik',
  bendahara: 'Bendahara',
  admin_wa: 'Admin WA',
}

interface Props {
  searchParams: Promise<{ error?: string; error_description?: string }>
}


export default async function DashboardPage({ searchParams }: Props) {
  // Kalau Supabase redirect ke sini dengan error → teruskan ke halaman yang tepat
  const params = await searchParams
  if (params.error === 'access_denied') {
    redirect('/lupa-password?expired=1')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('nama_lengkap, role')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-background-page p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-background-card border border-border-default rounded-xl p-6">
          <h1 className="h1 text-text-primary">Selamat datang 👋</h1>
          <p className="h3 text-primary mt-1">
            {profile?.nama_lengkap ?? '-'}
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-background-page
                           border border-border-default rounded-full
                           caption text-text-secondary">
            {profile?.role ? roleLabel[profile.role] : '-'}
          </span>
        </div>

        <LogoutButton />
      </div>
    </main>
  )
}