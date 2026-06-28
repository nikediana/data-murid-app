# GEMMA Ibnu Katsir
Sistem Manajemen Lembaga Belajar Al-Qur'an

---

## Tentang Aplikasi

GEMMA adalah aplikasi internal untuk lembaga non-formal GEMMA Ibnu Katsir. Mencakup manajemen murid, presensi mengajar, rekap kafalah guru, dan pembayaran Infaq Pendidikan (IP) murid.

- **190 murid aktif** | **38 kelas** | **22 guru** | **4 kategori kelas**
- **4 role pengguna:** guru, akademik, bendahara, admin_wa

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth + @supabase/ssr |
| Hosting | Cloudflare Pages/Workers |
| Adapter | @opennextjs/cloudflare |

---

## Setup Lokal

### 1. Clone repo

```bash
git clone https://github.com/nikediana/data-murid-app.git
cd data-murid-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

Ambil nilai dari **Supabase Dashboard → Settings → API**.

> ⚠️ Jangan pernah commit file `.env.local` ke GitHub.

### 4. Jalankan development server

```bash
npm run dev
```

Buka `http://localhost:3000`

---

## Deploy ke Cloudflare

Deploy otomatis terjadi setiap kali push ke branch `main`.

Untuk trigger manual:

```bash
git add .
git commit -m "pesan commit"
git push
```

Pantau build di **Cloudflare Dashboard → Workers & Pages → data-murid-app → Deployments**.

### Environment Variables di Cloudflare

Tambahkan di **Settings → Variables and Secrets**:

| Variable | Type |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Text |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Text |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret |

---

## Konfigurasi Supabase

**Authentication → URL Configuration:**

| Setting | Nilai |
|---|---|
| Site URL | `https://data-murid-app.nike-diana.workers.dev` |
| Redirect URLs | `http://localhost:3000/auth/callback` |
| | `https://data-murid-app.nike-diana.workers.dev/auth/callback` |

**Authentication → Email:**
- Confirm email: **OFF**
- Minimum password length: **8**

---

## Struktur Folder

```
src/
├── app/
│   ├── auth/callback/route.ts   ← PKCE auth callback
│   ├── dashboard/               ← Halaman utama setelah login
│   ├── login/                   ← Halaman login
│   ├── lupa-password/           ← Reset password flow
│   ├── murid/                   ← Data murid
│   └── reset-password/          ← Form password baru
├── lib/supabase/
│   ├── client.ts                ← Browser Supabase client
│   ├── server.ts                ← Server Supabase client
│   └── middleware.ts            ← Middleware Supabase client
└── middleware.ts                ← Route protection
```

---

## Catatan Penting

- **`middleware.ts` bukan `proxy.ts`** — Next.js 16 deprecated `middleware.ts` tapi Cloudflare hanya support Edge Runtime yang membutuhkan `middleware.ts`. Warning deprecasi di terminal adalah normal.
- **`export const dynamic = 'force-dynamic'`** wajib di setiap page yang query Supabase, untuk mencegah prerender error saat build.
- **Tailwind v4** — `cursor-pointer` tidak otomatis pada `<button>`, harus eksplisit.
- **Supabase free tier** auto-pause setelah 7 hari tidak aktif.

---

## Dokumentasi Lengkap

- [PRD v2.1](./GEMMA_PRD_v2.md) — Schema DB, business logic, build backlog
- [CLAUDE.md](./CLAUDE.md) — Konteks untuk AI assistant

---

*GEMMA Ibnu Katsir | github.com/nikediana/data-murid-app*
