import { getSession } from '@/lib/session'
import { createServerSupabase } from '@/lib/supabase-server'
import { ShoppingBag, Box, Users, TrendingUp } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default async function SellerDashboard() {
  const session = await getSession()
  const db = createServerSupabase()

  const [produkRes, pesananRes, pelangganRes] = await Promise.all([
    db.from('products').select('id', { count: 'exact' }).eq('penjual_id', session.user_id),
    db.from('order_details').select('pesanan_id, products!inner(penjual_id)', { count: 'exact' }).eq('products.penjual_id', session.user_id),
    db.from('order_details').select('orders!inner(pembeli_id), products!inner(penjual_id)').eq('products.penjual_id', session.user_id),
  ])

  const totalProduk = produkRes.count ?? 0
  const totalPesanan = pesananRes.count ?? 0
  const uniqueBuyers = new Set((pelangganRes.data || []).map(r => r.orders?.pembeli_id)).size

  // Recent products
  const { data: recentProducts } = await db.from('products').select('*').eq('penjual_id', session.user_id).order('created_at', { ascending: false }).limit(5)

  const stats = [
    { label: 'Total Produk', value: totalProduk, icon: <Box size={22}/>, color: '#6366f1', bg: '#ede9fe' },
    { label: 'Total Pesanan', value: totalPesanan, icon: <ShoppingBag size={22}/>, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Total Pelanggan', value: uniqueBuyers, icon: <Users size={22}/>, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Status Toko', value: 'Aktif', icon: <TrendingUp size={22}/>, color: '#3b82f6', bg: '#eff6ff' },
  ]

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Selamat Datang, {session.nama}! 👋
        </h1>
        <p style={{ color: '#64748b' }}>Kelola toko dan produkmu di sini.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: 0 }}>Produk Terbaru</h2>
          <a href="/penjual/produk" style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>Lihat Semua →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Nama Produk', 'Harga', 'Stok', 'Dibuat'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentProducts?.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>{p.nama_produk}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#6366f1', fontWeight: 700 }}>{fmt(p.harga)}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ background: p.stok > 0 ? '#ecfdf5' : '#fef2f2', color: p.stok > 0 ? '#10b981' : '#ef4444', padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>
                    {p.stok} unit
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                  {new Date(p.created_at).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
            {(!recentProducts || recentProducts.length === 0) && (
              <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Belum ada produk. <a href="/penjual/tambah-produk" style={{ color: '#6366f1' }}>Tambah sekarang</a></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
