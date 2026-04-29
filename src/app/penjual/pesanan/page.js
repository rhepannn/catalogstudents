'use client'
import { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, XCircle, ShoppingBag } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
const dateFmt = (d) => new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function PesananMasuk() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    fetch('/api/seller/orders')
      .then(r => r.json())
      .then(d => {
        setOrders(d.orders || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (orderId, newStatus) => {
    await fetch('/api/seller/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, status: newStatus })
    })
    fetchOrders()
  }

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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Pesanan Masuk 📦</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Kelola pesanan dari pembeli untuk produk yang kamu jual.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Memuat pesanan...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
          <ShoppingBag size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>Belum Ada Pesanan Masuk</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Terus promosikan produkmu supaya cepat laku!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => {
            const st = statusMap[order.status] || statusMap['pending']
            
            // Calculate total items from this seller specifically
            let totalBarang = 0;
            let totalPendapatan = 0;
            order.order_details.forEach(detail => {
              totalBarang += detail.jumlah;
              totalPendapatan += detail.subtotal;
            })

            return (
              <div key={order.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a', marginRight: '1rem' }}>Order #{order.id}</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{dateFmt(order.created_at)}</span>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                      Pembeli: <strong>{order.user_accounts?.nama || 'Unknown'}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: st.bg, color: st.color, padding: '0.4rem 1rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700 }}>
                      {st.icon} {st.label}
                    </div>
                    {/* Action buttons based on status */}
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="dibayar">Sudah Dibayar</option>
                      <option value="diproses">Diproses</option>
                      <option value="dikirim">Dikirim</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Dibatalkan</option>
                    </select>
                  </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  {order.order_details.map((detail, idx) => (
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

                <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#64748b' }}>Pendapatan dari pesanan ini ({totalBarang} barang)</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6366f1' }}>{fmt(totalPendapatan)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
