'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function Keranjang() {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const fetchCart = async () => {
    const res = await fetch('/api/cart')
    const data = await res.json()
    setCart(data.cart || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const removeItem = async (id) => {
    await fetch(`/api/cart?id=${id}`, { method: 'DELETE' })
    fetchCart()
  }

  const checkout = async () => {
    setCheckoutLoading(true)
    const res = await fetch('/api/orders', { method: 'POST' })
    if (res.ok) {
      router.push('/pembeli/pesanan')
    }
    setCheckoutLoading(false)
  }

  const total = cart.reduce((acc, item) => acc + (item.jumlah * item.products?.harga), 0)

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Keranjang Belanja 🛒</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Periksa kembali barang belanjaanmu sebelum checkout.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Memuat keranjang...</div>
      ) : cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
          <ShoppingBag size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>Keranjangmu Kosong</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Yuk, temukan produk menarik di katalog mahasiswa!</p>
          <a href="/pembeli/katalog" style={{ background: '#6366f1', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 50, textDecoration: 'none', fontWeight: 600 }}>Belanja Sekarang</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, background: '#f8fafc', overflow: 'hidden' }}>
                  {item.products?.gambar ? <img src={item.products.gambar} alt="Produk" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📦</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{item.products?.nama_produk}</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{fmt(item.products?.harga)} x {item.jumlah}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 800, color: '#6366f1', fontSize: '1.1rem' }}>{fmt(item.jumlah * item.products?.harga)}</p>
                  <button onClick={() => removeItem(item.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Trash2 size={14}/> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 16, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', position: 'sticky', top: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Ringkasan Belanja</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#64748b' }}>
              <span>Total Item</span>
              <span>{cart.length} barang</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0 1.5rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0', fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
              <span>Total Harga</span>
              <span style={{ color: '#6366f1' }}>{fmt(total)}</span>
            </div>
            <button onClick={checkout} disabled={checkoutLoading} style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none', padding: '1rem', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: checkoutLoading ? 0.7 : 1 }}>
              {checkoutLoading ? 'Memproses...' : <>Checkout Sekarang <ArrowRight size={18}/></>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
