'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload } from 'lucide-react'

const inp = { width: '100%', padding: '0.875rem 1rem', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
const lbl = { display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }

export default function TambahProduk() {
  const router = useRouter()
  const [form, setForm] = useState({ nama_produk: '', deskripsi: '', harga: '', stok: '', gambar: '', metode_pembayaran: '' })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, harga: parseFloat(form.harga), stok: parseInt(form.stok) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/penjual/produk')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 720 }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#6366f1', fontWeight: 600, padding: 0, marginBottom: '1rem' }}>
          <ArrowLeft size={16}/> Kembali
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Tambah Produk</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Isi detail produk yang akan dijual</p>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem' }}>{error}</div>}

      <form onSubmit={submit} style={{ background: 'white', borderRadius: 16, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={lbl}>Nama Produk *</label>
          <input style={inp} name="nama_produk" value={form.nama_produk} onChange={handle} placeholder="Contoh: Buku Catatan Premium" required />
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={lbl}>Deskripsi</label>
          <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} name="deskripsi" value={form.deskripsi} onChange={handle} placeholder="Deskripsi produk..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={lbl}>Harga (Rp) *</label>
            <input style={inp} type="number" name="harga" value={form.harga} onChange={handle} placeholder="Contoh: 25000" min="0" required />
          </div>
          <div>
            <label style={lbl}>Stok *</label>
            <input style={inp} type="number" name="stok" value={form.stok} onChange={handle} placeholder="Contoh: 50" min="0" required />
          </div>
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={lbl}>Metode Pembayaran (Nomor Rekening/E-Wallet) *</label>
          <input style={inp} name="metode_pembayaran" value={form.metode_pembayaran} onChange={handle} placeholder="Contoh: BCA 12345678 a/n Budi atau DANA 0812..." required />
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>Informasi ini akan muncul saat pembeli melakukan checkout.</p>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={lbl}>Gambar Produk</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ 
              ...inp, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', 
              width: 'max-content', background: '#f8fafc', color: '#64748b' 
            }}>
              <Upload size={16} />
              {uploading ? 'Mengunggah...' : 'Pilih Foto (Max 2MB)'}
              <input 
                type="file" 
                accept="image/*" 
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploading(true)
                  try {
                    const fd = new FormData()
                    fd.append('file', file)
                    const res = await fetch('/api/upload', { method: 'POST', body: fd })
                    const data = await res.json()
                    if (data.url) setForm(f => ({ ...f, gambar: data.url }))
                  } catch (err) {
                    setError('Gagal mengunggah gambar')
                  } finally {
                    setUploading(false)
                  }
                }} 
                style={{ display: 'none' }} 
              />
            </label>
            {form.gambar && <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>✓ Foto terunggah</div>}
          </div>
          {form.gambar && <img src={form.gambar} alt="preview" style={{ marginTop: '0.75rem', width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} onError={(e) => e.target.style.display='none'} />}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" disabled={loading} style={{
            flex: 1, padding: '0.875rem', background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Menyimpan...' : '💾 Simpan Produk'}
          </button>
          <button type="button" onClick={() => router.back()} style={{
            padding: '0.875rem 1.5rem', background: '#f8fafc', color: '#64748b',
            border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 600, cursor: 'pointer'
          }}>
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
