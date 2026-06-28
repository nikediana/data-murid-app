# GEMMA Ibnu Katsir
## Product Requirements Document (PRD) — v2.1
### Update: Juni 2026 | nikediana/data-murid-app

---

## 1. Ringkasan Eksekutif

GEMMA Ibnu Katsir adalah lembaga non-formal penyedia layanan belajar Al-Qur'an online dan offline. Aplikasi ini dibangun untuk mengotomasi operasional yang saat ini dikelola manual: presensi mengajar, rekap kafalah guru, pembayaran Infaq Pendidikan (IP) murid, dan manajemen kelas per periode.

| Atribut | Detail |
|---|---|
| Lembaga | GEMMA Ibnu Katsir |
| Murid Aktif | 190 murid |
| Kelas Aktif | 38 kelas |
| Kategori Kelas | Tahsin, Tahfidz, Privat, Irreguler |
| Periode Belajar | ±2,5 bulan per periode |
| Penggajian | Kafalah — berbasis jumlah TM × tarif per kategori kelas |
| Repo | github.com/nikediana/data-murid-app |

---

## 2. Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) | SSR + Server Components |
| Styling | Tailwind CSS v4 | Utility-first, mobile-first |
| Database | Supabase PostgreSQL | Region: Singapore |
| Auth | Supabase Auth + @supabase/ssr | Email + password, JWT, RLS |
| Storage | Supabase Storage | Foto profil, dokumen |
| Realtime | Supabase Realtime | Update status rekap live |
| Automation | Supabase Edge Functions + pg_cron | Auto-lock cut-off, notifikasi |
| WhatsApp | Fonnte API | Reminder & slip kafalah (Sprint 7) |
| Hosting | Cloudflare Pages/Workers | CI/CD otomatis dari GitHub push |
| Adapter | @opennextjs/cloudflare | Next.js → Cloudflare Workers |
| Export | SheetJS (xlsx) | Export rekap Excel |
| Repo | GitHub (nikediana/data-murid-app) | Auto-deploy ke Cloudflare |

### Catatan Penting Tech Stack

- **Hosting: Cloudflare** (bukan Vercel seperti di PSD v1.1)
- **Next.js 16:** file `proxy.ts` menggantikan `middleware.ts` secara default, TAPI Cloudflare hanya support Edge Runtime yang membutuhkan `middleware.ts`. Gunakan `middleware.ts` dan abaikan warning deprecasi.
- **Tailwind v4:** `cursor-pointer` tidak otomatis pada `<button>` — harus eksplisit.
- **Env vars:** prefix `NEXT_PUBLIC_` untuk client-side, tanpa prefix untuk server-only (`SUPABASE_SERVICE_ROLE_KEY`).

---

## 3. Konfigurasi Supabase

| Setting | Nilai |
|---|---|
| Site URL | `https://data-murid-app.nike-diana.workers.dev` |
| Redirect URLs | `http://localhost:3000/auth/callback` |
| | `https://data-murid-app.nike-diana.workers.dev/auth/callback` |
| Confirm email | OFF |
| Minimum password length | 8 |
| Password complexity | Tidak ada (bebas) |

---

## 4. User Roles & Access Matrix

### 4.1 Empat Role Pengguna

| Role | Estimasi | Akses Utama | Device Prioritas |
|---|---|---|---|
| `guru` | ~22 orang | Input presensi, kirim rekap | Mobile HP |
| `akademik` | ~2 orang | Manajemen kelas, periode, kalender, data murid | Web + Mobile |
| `bendahara` | ~1 orang | Rekap kafalah, IP murid, cut-off | Web + Mobile |
| `admin_wa` | ~2 orang | Pantau status grup WA kelas & ujian | Mobile |

### 4.2 Login Per Role

| Role | Username | Password Awal |
|---|---|---|
| `guru` / `admin_wa` | Nomor WA → dikonversi ke `[nomorwa]@gemma.internal` | Nomor WA itu sendiri |
| `akademik` / `bendahara` | Email asli | Diberikan admin saat setup |

Deteksi otomatis di form login: input mengandung `@` → email asli; input angka → nomor WA → synthetic email.

### 4.3 Reset Password Per Role

| Role | Cara Reset |
|---|---|
| `guru` / `admin_wa` | Hubungi PJ Aplikasi GEMMA — admin reset manual dari user management |
| `akademik` / `bendahara` | Self-service via email (Supabase reset password) |

---

## 5. Alur Bisnis Kritis

### 5.1 Presensi Mengajar & Rekap Kafalah (Bulanan)

```
[Awal Bulan]
    ↓
Guru input presensi harian → status: UNLOCKED
    ↓
PILIHAN A — Guru kirim rekap (sebelum cut-off):
    → status: LOCKED (Verified)
    → Bendahara dapat notifikasi

PILIHAN B — Guru tidak kirim sebelum cut-off:
    → Auto-lock tanggal cut-off (default tgl 23) via pg_cron
    → status: LOCKED (System)
    ↓
Bendahara hitung kafalah → finalisasi → kirim slip via WA
```

**Aturan Lock: PERMANEN — tidak bisa dibuka kembali via UI maupun API.**

### 5.2 Formula Kafalah

```
Kafalah = Σ (total_TM_per_kelas × tarif_per_tm[kategori_kelas])
```

Tarif dikonfigurasi bendahara di tabel `tarif_kafalah`.

---

## 6. Data Model — 14 Tabel

### Status Tabel

| Tabel | Status | Keterangan |
|---|---|---|
| `murid` | ✅ Dibuat | UUID PK, migration selesai |
| `users` | ✅ Dibuat | Sinkron dari auth.users |
| `periode` | ✅ Dibuat | |
| `kelas` | ✅ Dibuat | |
| `kelas_guru` | ✅ Dibuat | |
| `kelas_murid` | ✅ Dibuat | |
| `presensi` | ✅ Dibuat | is_locked critical |
| `presensi_detail` | ✅ Dibuat | |
| `rekap_bulanan` | ✅ Dibuat | |
| `infaq_pendidikan` | ✅ Dibuat | |
| `kalender_akademik` | ✅ Dibuat | |
| `nilai_ujian` | ✅ Dibuat | |
| `system_settings` | ✅ Dibuat | Default cutoff=23 |
| `tarif_kafalah` | ✅ Dibuat | Tidak ada di PSD v1.1 |

### RLS Status

| Tabel | RLS Enabled | Policy |
|---|---|---|
| `murid` | ✅ | temp_murid_read_all (sementara) |
| `users` | ✅ | users_read_own |
| Semua tabel lain | ✅ Enabled | 🔲 Policies belum dibuat (Sprint 0.5) |

---

## 7. Struktur File Project

```
src/
├── app/
│   ├── auth/callback/route.ts     ← PKCE code exchange (server)
│   ├── dashboard/
│   │   ├── page.tsx               ← Server Component
│   │   └── LogoutButton.tsx       ← Client Component
│   ├── login/page.tsx             ← Client Component
│   ├── lupa-password/page.tsx     ← Client Component (4 steps)
│   ├── murid/page.tsx             ← Server Component, force-dynamic
│   ├── reset-password/page.tsx    ← Client Component
│   ├── layout.tsx                 ← Inter font, metadata
│   ├── globals.css                ← Tailwind v4 @theme tokens
│   └── page.tsx                   ← Homepage
├── lib/supabase/
│   ├── client.ts                  ← Browser client (createBrowserClient)
│   ├── server.ts                  ← Server client (createServerClient + cookies)
│   └── middleware.ts              ← Middleware client (updateSession)
└── middleware.ts                  ← Route protection (BUKAN proxy.ts)
```

### Pola Penting

**Middleware routing rules:**
```
1. /lupa-password, /reset-password, /auth/callback → selalu boleh diakses
2. Belum login + di /login → tetap di /login
3. Belum login + selain itu → redirect ke /login
4. Sudah login + buka /login → redirect ke /dashboard
5. Sudah login + selain itu → izinkan akses
```

**Supabase client usage:**
- Server Component / Route Handler → `import { createClient } from '@/lib/supabase/server'` + `await createClient()`
- Client Component → `import { createClient } from '@/lib/supabase/client'` + `createClient()`

**force-dynamic:**
```tsx
export const dynamic = 'force-dynamic' // wajib di semua page yang query Supabase
```

---

## 8. Design System

### Colors

```css
--color-primary:          #1E4FA3
--color-primary-dark:     #163D80
--color-secondary:        #3A74D8
--color-accent:           #F5B700
--color-accent-hover:     #E0A500
--color-background:       #F8FAFC
--color-background-page:  #F8FAFC
--color-background-card:  #FFFFFF
--color-surface:          #FFFFFF
--color-border:           #D9E2EC
--color-border-default:   #E2E8F0
--color-text-primary:     #1E293B
--color-text-secondary:   #64748B
--color-text-placeholder: #94A3B8
--color-text-disabled:    #CBD5E1
--color-success:          #2E7D32
--color-warning:          #ED8B00
--color-error:            #D32F2F
--color-hadir:            #2E7D32
--color-izin:             #ED8B00
--color-sakit:            #3A74D8
--color-alpa:             #D32F2F
--color-locked:           #52606D
```

### Typography

| Class | Ukuran | Weight |
|---|---|---|
| `.h1` | 24px | Bold |
| `.h2` | 20px | SemiBold |
| `.h3` | 18px | Medium |
| `.body-text` | 16px | Regular, line-height 1.6 |
| `.small` | 14px | Regular |
| `.caption` | 12px | Regular |

Font: **Inter** via `next/font/google`

---

## 9. Prioritized Build Backlog

### Sprint 0 — Foundation ✅ Selesai (kecuali 0.5 & 0.6)

| # | Tugas | Status |
|---|---|---|
| 0.1 | Scaffold Next.js + Tailwind + Cloudflare + Supabase | ✅ |
| 0.2 | Tabel murid (migration ke UUID) | ✅ |
| 0.3 | Halaman Read murid (/murid) | ✅ |
| 0.4 | SQL: 13 tabel sisanya | ✅ |
| 0.5 | RLS policies semua tabel | 🔲 Ditunda setelah Sprint 1 |
| 0.6 | pg_cron: job auto-lock cut-off | 🔲 Sprint 4 |

### Sprint 1 — Auth ✅ Selesai (kecuali 1.4)

| # | Tugas | Status |
|---|---|---|
| 1.1 | Login email + WA (synthetic email) | ✅ |
| 1.2 | Session persist 30 hari | ✅ |
| 1.3 | Role-based routing (middleware.ts) | ✅ |
| 1.4 | User management — CRUD users + assign role | 🔲 Masuk Sprint 2 |
| 1.5 | Redirect unauthorized ke /login | ✅ |
| 1.6 | Lupa password (4 step UI) | ✅ |
| 1.7 | Reset password via email (/auth/callback PKCE) | ✅ |
| 1.8 | Logout | ✅ |

### Sprint 2 — Master Data (Next)

| # | Fitur | Role |
|---|---|---|
| 2.0 | RLS policies semua tabel (lanjutan 0.5) | System |
| 2.1 | User management — CRUD + assign role | Akademik |
| 2.2 | CRUD Murid — Create | Akademik |
| 2.3 | CRUD Murid — Edit | Akademik |
| 2.4 | CRUD Murid — Soft Delete (is_active = false) | Akademik |
| 2.5 | CRUD Periode | Akademik |
| 2.6 | CRUD Kelas + assign guru | Akademik |
| 2.7 | Assign murid ke kelas per periode | Akademik |

### Sprint 3 — Presensi Core (P1)
### Sprint 4 — Lock System & Dashboard (P1 Critical)
### Sprint 5 — Kafalah & Keuangan (P2)
### Sprint 6 — Fitur Pendukung (P3)
### Sprint 7 — Otomasi & PWA (P4)

*Detail Sprint 3–7 lihat PRD v2.0*

---

## 10. Glosarium

| Istilah | Definisi |
|---|---|
| TM | Tatap Muka — 1 sesi mengajar = 1 TM |
| Kafalah | Penggajian guru berbasis TM × tarif per kategori |
| IP | Infaq Pendidikan — biaya bulanan murid |
| Cut-off | Tanggal batas input presensi (default tgl 23) |
| Lock (Verified) | Guru kirim rekap sebelum cut-off |
| Lock (System) | Auto-lock oleh pg_cron saat cut-off |
| PKCE | Proof Key for Code Exchange — flow keamanan auth |
| Synthetic email | Format `[nomorwa]@gemma.internal` untuk guru |
| RLS | Row Level Security PostgreSQL |
| PWA | Progressive Web App |

---

## 11. Riwayat Dokumen

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | Maret 2025 | Dokumen awal |
| 1.1 | Maret 2025 | Update alur rekonsiliasi, skema DB |
| 2.0 | Juni 2026 | Tech stack Cloudflare, peserta→murid, tarif_kafalah |
| 2.1 | Juni 2026 | Update Sprint 0–1 status, middleware→proxy→middleware (Cloudflare), PKCE auth callback, login synthetic email, reset password flow, design system final |

---

*GEMMA PRD v2.1 | Juni 2026 | github.com/nikediana/data-murid-app*
