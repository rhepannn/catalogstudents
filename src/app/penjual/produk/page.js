'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Pencil, Trash2, Plus, RefreshCw } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function ProdukSaya() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState('connecting')

  const fetchProducts = useCallback(async () => {
    const res = await fetch('/api/products/mine')
    const data = await res.json()
    setProducts(data.products || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()

    // Supabase Realtime — listen for INSERT/UPDATE/DELETE on products
    const channel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts() // refetch on any change
      })
      .subscribe((status) => setRealtimeStatus(status))

    return () => supabase.removeChannel(channel)
  }, [fetchProducts])

  const confirmDelete = (id) => {
    setDeleteId(id)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsModalOpen(false)
    const id = deleteId
    setDeleteId(id) // keep it for the loading state on the button if needed, but let's just use it
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus produk')
      await fetchProducts()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Produk Saya</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Kelola semua produkmu</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{
            background: realtimeStatus === 'SUBSCRIBED' ? '#ecfdf5' : '#fef3c7',
            color: realtimeStatus === 'SUBSCRIBED' ? '#10b981' : '#d97706',
            padding: '0.3rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
            {realtimeStatus === 'SUBSCRIBED' ? 'Realtime' : 'Connecting...'}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <p>Memuat produk...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
              <div style={{ position: 'relative', height: 200, background: '#f8fafc' }}>
                {p.gambar ? (
                  <img src={p.gambar} alt={p.nama_produk} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📦</div>
                )}
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  background: p.stok > 0 ? '#10b981' : '#ef4444', color: 'white',
                  padding: '0.2rem 0.65rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700
                }}>
                  {p.stok > 0 ? `Stok: ${p.stok}` : 'Habis'}
                </span>
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem', lineHeight: 1.3 }}>{p.nama_produk}</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.deskripsi || 'Tidak ada deskripsi'}
                </p>
                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#6366f1', marginBottom: '1rem' }}>{fmt(p.harga)}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/penjual/edit-produk/${p.id}`} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    padding: '0.6rem', borderRadius: 8, border: '1px solid #e2e8f0',
                    color: '#6366f1', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
                    background: '#f8fafc'
                  }}>
                    <Pencil size={14}/> Edit
                  </Link>
                  <button onClick={() => confirmDelete(p.id)} disabled={deleteId === p.id} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    padding: '0.6rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: deleteId === p.id ? '#f1f5f9' : '#fef2f2', color: '#ef4444', fontWeight: 600, fontSize: '0.85rem'
                  }}>
                    <Trash2 size={14}/> {deleteId === p.id ? '...' : 'Hapus'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', color: '#64748b' }}>Belum ada produk</p>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Gunakan menu di sidebar untuk mulai berjualan.</p>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 20, padding: '2rem',
            maxWidth: 400, width: '100%', textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', background: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', color: '#ef4444'
            }}>
              <Trash2 size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Hapus Produk?</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              Apakah Anda yakin ingin menghapus produk ini? Data yang sudah dihapus tidak dapat dikembalikan.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0',
                  background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button 
                onClick={handleDelete}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none',
                  background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
