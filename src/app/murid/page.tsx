import { getSupabaseClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'  // ← tambahkan baris ini

export default async function DataMuridPage() {
  const supabase = getSupabaseClient()

  const { data: muridList, error } = await supabase
    .from('murid')
    .select('*')
    .order('nomor_registrasi', { ascending: true })

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Data Murid</h1>
        <p className="text-red-600">Gagal memuat data: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Data Murid</h1>

      {muridList && muridList.length === 0 ? (
        <p className="text-gray-500">Belum ada data murid.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-medium">No. Registrasi</th>
                <th className="px-4 py-3 font-medium">Nama Lengkap</th>
                <th className="px-4 py-3 font-medium">Tgl Registrasi</th>
                <th className="px-4 py-3 font-medium">Jenis Kelamin</th>
                <th className="px-4 py-3 font-medium">Usia Saat Registrasi</th>
                <th className="px-4 py-3 font-medium">Alamat</th>
                <th className="px-4 py-3 font-medium">Kota</th>
                <th className="px-4 py-3 font-medium">No WhatsApp</th>
                <th className="px-4 py-3 font-medium">Pekerjaan</th>
                <th className="px-4 py-3 font-medium">Instansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {muridList?.map((murid) => (
                <tr key={murid.nomor_registrasi} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{murid.nomor_registrasi}</td>
                  <td className="px-4 py-3">{murid.nama_lengkap}</td>
                  <td className="px-4 py-3">{murid.tanggal_registrasi}</td>
                  <td className="px-4 py-3">{murid.jenis_kelamin}</td>
                  <td className="px-4 py-3">{murid.usia_saat_registrasi}</td>
                  <td className="px-4 py-3">{murid.alamat_lengkap}</td>
                  <td className="px-4 py-3">{murid.kota}</td>
                  <td className="px-4 py-3">{murid.no_whatsapp}</td>
                  <td className="px-4 py-3">{murid.pekerjaan}</td>
                  <td className="px-4 py-3">{murid.nama_instansi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}