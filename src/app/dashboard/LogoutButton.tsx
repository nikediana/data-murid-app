'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full border border-border-default text-text-secondary
           hover:bg-background-page rounded-xl py-3 text-sm
           font-medium transition-colors cursor-pointer"
    >
      Keluar
    </button>
  )
}