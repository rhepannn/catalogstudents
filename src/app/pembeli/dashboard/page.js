import { getSession } from '@/lib/session'
import { createServerSupabase } from '@/lib/supabase-server'
import { LayoutDashboard, ShoppingBag, MessageSquare } from 'lucide-react'

export default async function PembelijDashboard() {
  const session = await getSession()
  const db = createServerSupabase()

  const [pesananRes, produkRes] = await Promise.all([
    db.from('orders').select('id', { count: 'exact' }).eq('pembeli_id', session.user_id),
    db.from('products').select('id', { count: 'exact' }),
  ])

  const stats = [
    { label: 'Pesanan Saya', value: pesananRes.count ?? 0, icon: '📦', color: '#6366f1', bg: '#ede9fe' },
    { label: 'Produk Tersedia', value: produkRes.count ?? 0, icon: '🛍️', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Status Akun', value: 'Aktif', icon: '✅', color: '#3b82f6', bg: '#eff6ff' },
  ]

  // Recent orders
  const { data: orders } = await db
    .from('orders')
    .select('*, order_details(*, products(nama_produk))')
    .eq('pembeli_id', session.user_id)
    .order('created_at', { ascending: false })
    .limit(5)

  const statusColors = {
    pending: { bg: '#f3f4f6', color: '#6b7280' },
    dibayar: { bg: '#eff6ff', color: '#3b82f6' },
    diproses: { bg: '#fef3c7', color: '#d97706' },
    dikirim: { bg: '#e0f2fe', color: '#0369a1' },
    selesai: { bg: '#ecfdf5', color: '#10b981' },
    dibatalkan: { bg: '#fee2e2', color: '#ef4444' },
  }

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Halo, {session.nama}! 👋
        </h1>
        <p style={{ color: '#64748b' }}>Selamat berbelanja di Catalog Students.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</p>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        <a href="/pembeli/katalog" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', padding: '1.5rem', borderRadius: 16, textDecoration: 'none', fontWeight: 700 }}>
          <span style={{ fontSize: '2rem' }}>🛍️</span>
          <div><div style={{ fontSize: '1rem', fontWeight: 700 }}>Lihat Katalog</div><div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Temukan produk baru</div></div>
        </a>
        <a href="/chat" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '1.5rem', borderRadius: 16, textDecoration: 'none', fontWeight: 700 }}>
          <span style={{ fontSize: '2rem' }}>💬</span>
          <div><div style={{ fontSize: '1rem', fontWeight: 700 }}>Chat Seller</div><div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Tanya langsung ke penjual</div></div>
        </a>
      </div>

      {/* Recent Orders */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: 0 }}>Pesanan Terbaru</h2>
        </div>
        {orders?.length > 0 ? orders.map(o => (
          <div key={o.id} style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '0.9rem' }}>
                Pesanan #{o.id} — {o.order_details?.[0]?.products?.nama_produk || 'Produk'}
                {o.order_details?.length > 1 ? ` +${o.order_details.length - 1} item lainnya` : ''}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>{new Date(o.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 800, color: '#6366f1' }}>{fmt(o.total_harga)}</span>
              <span style={{ ...(statusColors[o.status] || statusColors.pending), padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>
                {o.status}
              </span>
            </div>
          </div>
        )) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <p>Belum ada pesanan. <a href="/pembeli/katalog" style={{ color: '#6366f1', fontWeight: 600 }}>Yuk belanja!</a></p>
          </div>
        )}
      </div>
    </div>
  )
}
