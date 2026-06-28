export default function Home() {
  return (
    <main className="p-8 space-y-6 bg-background min-h-screen">

      {/* Brand */}
      <section className="space-y-2">
        <p className="text-xs text-text-secondary uppercase tracking-wide">Brand</p>
        <div className="flex gap-2">
          <div className="bg-primary text-white px-4 py-2 rounded">Primary</div>
          <div className="bg-primary-dark text-white px-4 py-2 rounded">Primary Dark</div>
          <div className="bg-secondary text-white px-4 py-2 rounded">Secondary</div>
          <div className="bg-accent text-text-primary px-4 py-2 rounded font-semibold">Accent CTA</div>
        </div>
      </section>

      {/* Semantic */}
      <section className="space-y-2">
        <p className="text-xs text-text-secondary uppercase tracking-wide">Semantic</p>
        <div className="flex gap-2">
          <div className="bg-success text-white px-4 py-2 rounded">Success</div>
          <div className="bg-warning text-white px-4 py-2 rounded">Warning</div>
          <div className="bg-error text-white px-4 py-2 rounded">Error</div>
        </div>
      </section>

      {/* Status Presensi */}
      <section className="space-y-2">
        <p className="text-xs text-text-secondary uppercase tracking-wide">Status Presensi</p>
        <div className="flex gap-2">
          <span className="bg-hadir text-white px-3 py-1 rounded font-medium">H Hadir</span>
          <span className="bg-izin text-white px-3 py-1 rounded font-medium">I Izin</span>
          <span className="bg-sakit text-white px-3 py-1 rounded font-medium">S Sakit</span>
          <span className="bg-alpa text-white px-3 py-1 rounded font-medium">A Alpa</span>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-2 bg-surface p-4 rounded-lg border border-border">
        <p className="text-xs text-text-secondary uppercase tracking-wide">Typography — Inter</p>
        <p className="h1 text-text-primary">Heading 1 — GEMMA Ibnu Katsir</p>
        <p className="h2 text-text-primary">Heading 2 — Data Murid</p>
        <p className="h3 text-text-primary">Heading 3 — Presensi Mengajar</p>
        <p className="body-text text-text-primary">Body — Ini adalah contoh teks isi halaman dengan leading-relaxed agar mudah dibaca di layar kecil.</p>
        <p className="small text-text-secondary">Small — Keterangan tambahan, label form</p>
        <p className="caption text-text-secondary">Caption — Timestamp, metadata kecil</p>
      </section>

      {/* Surface & Border */}
      <section className="bg-surface border border-border rounded-lg p-4">
        <p className="h3 text-text-primary">Card / Surface</p>
        <p className="body-text text-text-secondary">Ini contoh card dengan background surface dan border standar GEMMA.</p>
      </section>

    </main>
  )
}