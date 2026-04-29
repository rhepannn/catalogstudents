'use client'
import { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
const dateFmt = (d) => new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function Pesanan() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [payOrder, setPayOrder] = useState(null)

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => {
        setOrders(d.orders || [])
        setLoading(false)
      })
  }, [])

  const statusMap = {
    'pending': { color: '#d97706', bg: '#fef3c7', icon: <Clock size={16}/>, label: 'Menunggu Pembayaran' },
    'dibayar': { color: '#3b82f6', bg: '#eff6ff', icon: <CheckCircle size={16}/>, label: 'Sudah Dibayar' },
    'diproses': { color: '#6366f1', bg: '#e0e7ff', icon: <Package size={16}/>, label: 'Sedang Diproses' },
    'dikirim': { color: '#0ea5e9', bg: '#e0f2fe', icon: <Package size={16}/>, label: 'Sedang Dikirim' },
    'selesai': { color: '#10b981', bg: '#ecfdf5', icon: <CheckCircle size={16}/>, label: 'Selesai' },
    'dibatalkan': { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={16}/>, label: 'Dibatalkan' },
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Daftar Pesanan 📦</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Pantau status pesanan belanjaanmu di sini.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Memuat pesanan...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
          <Package size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>Belum Ada Pesanan</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Kamu belum pernah belanja apapun. Yuk mulai belanja!</p>
          <a href="/pembeli/katalog" style={{ background: '#6366f1', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 50, textDecoration: 'none', fontWeight: 600 }}>Cari Produk</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => {
            const st = statusMap[order.status] || statusMap['pending']
            return (
              <div key={order.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {/* Header Pesanan */}
                <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a', marginRight: '1rem' }}>Order #{order.id}</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{dateFmt(order.created_at)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: st.bg, color: st.color, padding: '0.4rem 1rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700 }}>
                    {st.icon} {st.label}
                  </div>
                </div>

                {/* Detail Item */}
                <div style={{ padding: '1.5rem' }}>
                  {order.order_details?.map((detail, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1.25rem', marginBottom: idx !== order.order_details.length - 1 ? '1.5rem' : 0, borderBottom: idx !== order.order_details.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: idx !== order.order_details.length - 1 ? '1.5rem' : 0 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 8, background: '#f1f5f9', overflow: 'hidden' }}>
                        {detail.products?.gambar ? <img src={detail.products.gambar} alt="Produk" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📦</div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{detail.products?.nama_produk}</h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{detail.jumlah} barang x {fmt(detail.subtotal / detail.jumlah)}</p>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {fmt(detail.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Pesanan */}
                <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>Total Belanja</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6366f1' }}>{fmt(order.total_harga)}</span>
                  </div>
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => setPayOrder(order)}
                      style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      💳 Bayar Sekarang
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Payment Modal */}
      {payOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 450, width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', textAlign: 'center' }}>Instruksi Pembayaran 💳</h3>
            <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '2rem' }}>Silakan lakukan pembayaran sebesar <strong style={{ color: '#6366f1' }}>{fmt(payOrder.total_harga)}</strong> ke rekening penjual:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {[...new Set(payOrder.order_details.map(d => d.products?.metode_pembayaran))].map((method, idx) => (
                <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>METODE PEMBAYARAN</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>{method || 'Hubungi Seller'}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: 12, marginBottom: '2rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5 }}>
                <strong>Penting:</strong> Setelah transfer, kirimkan bukti pembayaran ke <strong>Chat Seller</strong> agar pesananmu segera diproses.
              </p>
            </div>

            <button 
              onClick={() => setPayOrder(null)}
              style={{ width: '100%', background: '#6366f1', color: 'white', border: 'none', padding: '1rem', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Saya Sudah Transfer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
