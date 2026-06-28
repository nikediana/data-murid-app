# CLAUDE.md — Konteks GEMMA untuk AI Assistant

File ini digunakan sebagai konteks saat memulai sesi baru dengan AI assistant (Claude, dll).
Paste isi file ini di awal percakapan sebelum meminta bantuan coding.

---

## Identitas Project

**Nama:** GEMMA Ibnu Katsir
**Repo:** github.com/nikediana/data-murid-app
**Deskripsi:** Sistem manajemen internal lembaga non-formal belajar Al-Qur'an.
**Scale:** 190 murid, 38 kelas, 22 guru, ~27 total pengguna.

---

## Tech Stack

```
Next.js 16 (App Router, TypeScript)
Tailwind CSS v4
Supabase PostgreSQL (auth + database)
Cloudflare Pages/Workers (hosting)
@opennextjs/cloudflare (adapter)
@supabase/ssr (auth di Next.js)
```

---

## Keputusan Arsitektur Penting

### 1. middleware.ts BUKAN proxy.ts
Next.js 16 deprecated `middleware.ts` → `proxy.ts`, TAPI Cloudflare hanya support Edge Runtime yang membutuhkan `middleware.ts`. Gunakan `middleware.ts` dan abaikan warning deprecasi.

### 2. Login system
- Guru/admin_wa: login pakai nomor WA → dikonversi ke synthetic email `[nomorwa]@gemma.internal`
- Akademik/bendahara: login pakai email asli
- Deteksi otomatis: input ada `@` → email asli, input angka → nomor WA

```typescript
function getLoginEmail(input: string): string {
  if (input.includes('@')) return input.trim()
  const digits = input.replace(/\D/g, '')
  return `${digits}@gemma.internal`
}
```

### 3. Supabase client — 3 versi berbeda

```typescript
// Server Component / Route Handler
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client Component
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Middleware (src/middleware.ts)
import { updateSession } from '@/lib/supabase/middleware'
```

### 4. force-dynamic wajib di semua page yang query Supabase

```typescript
export const dynamic = 'force-dynamic'
```

Tanpa ini, Next.js mencoba prerender halaman saat build → Supabase belum tersedia → error.

### 5. Auth callback route untuk PKCE

Reset password menggunakan route handler `/auth/callback` di server:
```
Email link → /auth/callback?code=xxx (server: exchangeCodeForSession)
           → redirect ke /reset-password (form password baru)
```

### 6. Middleware routing rules

```
1. /lupa-password, /reset-password, /auth/callback → selalu boleh diakses
2. Belum login + sedang di /login → tetap di /login
3. Belum login + selain itu → redirect ke /login
4. Sudah login + buka /login → redirect ke /dashboard
5. Sudah login + selain itu → izinkan akses
```

### 7. Tailwind v4
- `cursor-pointer` TIDAK otomatis pada `<button>` — harus eksplisit
- Token warna didefinisikan di `globals.css` dalam blok `@theme`
- Gunakan token: `bg-primary`, `text-text-primary`, `border-border-default`, dst.

### 8. Nama tabel
- `murid` (bukan `peserta`)
- `kelas_murid` (bukan `kelas_peserta`)
- Primary key semua tabel: UUID (`gen_random_uuid()`)

### 9. Supabase environment variables
```
NEXT_PUBLIC_SUPABASE_URL              → client + server
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  → client + server (bukan ANON_KEY)
SUPABASE_SERVICE_ROLE_KEY             → server only, tanpa NEXT_PUBLIC_
```

---

## Design System

```css
/* Brand */
--color-primary:          #1E4FA3
--color-primary-dark:     #163D80
--color-secondary:        #3A74D8
--color-accent:           #F5B700    /* CTA/Button */
--color-accent-hover:     #E0A500

/* Layout */
--color-background-page:  #F8FAFC
--color-background-card:  #FFFFFF
--color-border-default:   #E2E8F0

/* Text */
--color-text-primary:     #1E293B
--color-text-secondary:   #64748B
--color-text-placeholder: #94A3B8
--color-text-disabled:    #CBD5E1

/* Semantic */
--color-success:  #2E7D32
--color-warning:  #ED8B00
--color-error:    #D32F2F

/* Status Presensi */
--color-hadir: #2E7D32   /* H */
--color-izin:  #ED8B00   /* I */
--color-sakit: #3A74D8   /* S */
--color-alpa:  #D32F2F   /* A */
```

Font: **Inter** via `next/font/google`

Typography classes: `.h1` (24px bold), `.h2` (20px semibold), `.h3` (18px medium), `.body-text` (16px), `.small` (14px), `.caption` (12px)

---

## Database — 14 Tabel

```
users           → profil & role (sinkron dari auth.users)
murid           → master data murid (UUID PK) ✅ migration done
periode         → siklus belajar ±2,5 bulan
kelas           → kelas per periode (kategori: tahsin/tahfidz/privat/irreguler)
kelas_guru      → relasi kelas ↔ guru
kelas_murid     → relasi murid ↔ kelas per periode
presensi        → header sesi mengajar (is_locked KRITIS)
presensi_detail → kehadiran per murid per sesi (H/I/S/A)
rekap_bulanan   → status rekap kafalah per guru per bulan
infaq_pendidikan → status bayar IP per murid per bulan
kalender_akademik → event kalender lembaga
nilai_ujian     → nilai ujian per murid per periode
system_settings → konfigurasi (default: cutoff_day=23)
tarif_kafalah   → tarif per TM per kategori kelas (dikonfigurasi bendahara)
```

### Business Logic Kritis: Lock Presensi
- `is_locked = true` → PERMANEN, tidak bisa diubah
- RLS PostgreSQL memblokir UPDATE/DELETE pada baris locked
- Lock terjadi saat guru kirim rekap (manual) ATAU pg_cron pada tgl cut-off (auto)

---

## Sprint Status

### ✅ Sprint 0 — Foundation (selesai kecuali 0.5 & 0.6)
- Scaffold, tabel murid, read murid, 13 tabel lainnya ✅
- RLS policies 🔲 (hanya sementara untuk murid & users)
- pg_cron auto-lock 🔲

### ✅ Sprint 1 — Auth (selesai kecuali 1.4)
- Login (email + WA synthetic), session, middleware, logout ✅
- Lupa password (4 step), reset via email (PKCE) ✅
- User management CRUD 🔲 (masuk Sprint 2)

### 🔲 Sprint 2 — Master Data (sedang dikerjakan)
- RLS policies semua tabel
- User management (CRUD + assign role)
- CRUD Murid (Create, Edit, Soft Delete)
- CRUD Periode
- CRUD Kelas + assign guru
- Assign murid ke kelas

---

## Struktur File

```
src/
├── app/
│   ├── auth/callback/route.ts     ← PKCE exchange (server)
│   ├── dashboard/page.tsx         ← Server Component
│   ├── dashboard/LogoutButton.tsx ← Client Component
│   ├── login/page.tsx             ← Client Component
│   ├── lupa-password/page.tsx     ← Client Component (4 steps)
│   ├── murid/page.tsx             ← Server Component, force-dynamic
│   ├── reset-password/page.tsx    ← Client Component
│   ├── layout.tsx
│   ├── globals.css                ← Tailwind @theme tokens
│   └── page.tsx
├── lib/supabase/
│   ├── client.ts                  ← createBrowserClient
│   ├── server.ts                  ← createServerClient + cookies
│   └── middleware.ts              ← updateSession
└── middleware.ts                  ← Route protection (BUKAN proxy.ts)
```

---

## Catatan untuk AI Assistant

- Ikuti pola kode yang sudah ada — jangan ubah arsitektur tanpa diskusi dulu
- Semua tabel pakai UUID, semua nama kolom snake_case
- Halaman yang query Supabase WAJIB ada `export const dynamic = 'force-dynamic'`
- Jangan pakai `proxy.ts` — gunakan `middleware.ts`
- Jangan pakai `NEXT_PUBLIC_SUPABASE_ANON_KEY` — gunakan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Tailwind v4: selalu tambah `cursor-pointer` pada elemen interaktif
- Ikuti design system yang sudah didefinisikan — jangan pakai warna hardcode
- Bahasa UI: Bahasa Indonesia

---

*GEMMA PRD v2.1 | Juni 2026 | Update file ini setiap sprint selesai*
