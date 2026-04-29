'use client'
import { useState, useEffect } from 'react'
import { Users, Mail, ShoppingBag } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
const dateFmt = (d) => new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })

export default function DaftarPelanggan() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seller/customers')
      .then(r => r.json())
      .then(d => {
        setCustomers(d.customers || [])
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Daftar Pelanggan 👥</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Lihat siapa saja mahasiswa yang berlangganan produkmu.</p>
        </div>
        <div style={{ background: 'white', padding: '0.75rem 1.25rem', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Pelanggan</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{customers.length}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Memuat daftar pelanggan...</div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
          <Users size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>Belum Ada Pelanggan</h3>
          <p style={{ color: '#64748b' }}>Belum ada pembeli yang memesan produkmu.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Profil Pembeli</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Pesanan</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Pengeluaran</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Pesanan Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i !== customers.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                        {c.nama?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>{c.nama}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#64748b' }}><Mail size={12}/> {c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      <ShoppingBag size={14} style={{ color: '#94a3b8' }}/> {c.total_orders}x Pesan
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: '#10b981' }}>
                    {fmt(c.total_spent)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                    {dateFmt(c.last_order_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
