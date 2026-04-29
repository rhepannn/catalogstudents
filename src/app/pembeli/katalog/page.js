'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ShoppingCart, Search } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function Katalog() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [realtimeStatus, setRealtimeStatus] = useState('connecting')
  const [adding, setAdding] = useState(null)
  const [toast, setToast] = useState('')

  const fetchProducts = useCallback(async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data.products || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()

    // Supabase Realtime — produk baru langsung muncul
    const channel = supabase
      .channel('katalog-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe((status) => setRealtimeStatus(status))

    return () => supabase.removeChannel(channel)
  }, [fetchProducts])

  useEffect(() => {
    setFiltered(products.filter(p => p.nama_produk.toLowerCase().includes(search.toLowerCase())))
  }, [products, search])

  const addToCart = async (productId) => {
    setAdding(productId)
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produk_id: productId, jumlah: 1 })
    })
    setAdding(null)
    if (res.ok) {
      setToast('✅ Ditambahkan ke keranjang!')
      setTimeout(() => setToast(''), 2500)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#0f172a', color: 'white', padding: '0.875rem 1.25rem', borderRadius: 12, fontWeight: 600, zIndex: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Katalog Produk</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>{filtered.length} produk tersedia</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ background: realtimeStatus === 'SUBSCRIBED' ? '#ecfdf5' : '#fef3c7', color: realtimeStatus === 'SUBSCRIBED' ? '#10b981' : '#d97706', padding: '0.3rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
            {realtimeStatus === 'SUBSCRIBED' ? 'Live' : 'Connecting...'}
          </span>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." style={{ padding: '0.65rem 1rem 0.65rem 2.25rem', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', fontSize: '0.9rem', width: 200 }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>Memuat katalog...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(p => (
            <div key={p.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ height: 200, background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                {p.gambar ? <img src={p.gambar} alt={p.nama_produk} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>📦</div>}
                <span style={{ position: 'absolute', top: 12, right: 12, background: p.stok > 0 ? '#10b981' : '#ef4444', color: 'white', padding: '0.2rem 0.65rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700 }}>
                  {p.stok > 0 ? 'Tersedia' : 'Habis'}
                </span>
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>oleh {p.user_accounts?.nama || 'Penjual'}</p>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.3 }}>{p.nama_produk}</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.deskripsi || '—'}
                </p>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#6366f1', marginBottom: '0.875rem' }}>{fmt(p.harga)}</p>
                <button onClick={() => addToCart(p.id)} disabled={adding === p.id || p.stok === 0} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.7rem', borderRadius: 10, border: 'none', cursor: p.stok === 0 ? 'not-allowed' : 'pointer',
                  background: p.stok === 0 ? '#f1f5f9' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: p.stok === 0 ? '#94a3b8' : 'white', fontWeight: 700, fontSize: '0.875rem',
                  opacity: adding === p.id ? 0.7 : 1
                }}>
                  <ShoppingCart size={15}/> {p.stok === 0 ? 'Stok Habis' : adding === p.id ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
              <p style={{ fontSize: '3rem' }}>🔍</p>
              <p style={{ fontWeight: 600 }}>Produk tidak ditemukan</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
