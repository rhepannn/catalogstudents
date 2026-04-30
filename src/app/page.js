'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Store, BookOpen, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data.products?.slice(0, 8) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts();

    // Realtime listener
    const channel = supabase
      .channel('landing-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchProducts]);
  return (
    <>
      {/* Navbar */}
      <nav style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Brand */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              <ShoppingBag size={18} />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#0f172a' }}>
              Catalog Students
            </span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" style={{ fontWeight: 600, color: '#1e293b', textDecoration: 'none' }}>Home</Link>
            <Link href="/login" style={{ fontWeight: 600, color: '#1e293b', textDecoration: 'none' }}>Login</Link>
            <Link href="/register" style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white', fontWeight: 700,
              padding: '0.5rem 1.5rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            }}>
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '8rem 0 5rem',
        background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%)',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '3rem', width: '100%' }}>
          
          {/* Text centered */}
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
              background: '#e0e7ff', color: '#6366f1',
              padding: '0.5rem 1.25rem', borderRadius: '50px',
              fontWeight: 700, fontSize: '0.875rem',
              display: 'inline-block', marginBottom: '1.5rem'
            }}>
              Student Marketplace ✨
            </span>

            <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
              Marketplace Produk<br />
              Terbaik untuk{' '}
              <span style={{ color: '#6366f1' }}>Mahasiswa.</span>
            </h1>

            <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2.5rem', maxWidth: '700px', lineHeight: 1.7 }}>
              Jual dan beli produk kreatif antar mahasiswa dengan mudah, aman, dan menyenangkan. Bangun ekonomi kampusmu sekarang!
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/register" style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', fontWeight: 700, fontSize: '1rem',
                padding: '1rem 2.5rem', borderRadius: '50px',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
                transition: 'all 0.2s'
              }}>
                Mulai Sekarang
              </Link>
              <Link href="/login" style={{
                background: 'white',
                color: '#6366f1', fontWeight: 700, fontSize: '1rem',
                padding: '1rem 2.5rem', borderRadius: '50px',
                textDecoration: 'none', border: '2px solid #e0e7ff',
                transition: 'all 0.2s'
              }}>
                Cek Katalog
              </Link>
            </div>

            {/* Stats centered */}
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3.5rem', justifyContent: 'center' }}>
              {[
                { value: '500+', label: 'Produk' },
                { value: '200+', label: 'Penjual' },
                { value: '1k+', label: 'Pembeli' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>{s.value}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Section - Only show if loading or has products */}
      {(loading || products.length > 0) && (
        <section style={{ padding: '6rem 0', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{
              background: '#e0e7ff', color: '#6366f1',
              padding: '0.5rem 1.25rem', borderRadius: '50px',
              fontWeight: 700, fontSize: '0.875rem',
              display: 'inline-block', marginBottom: '1rem'
            }}>
              Hot Items 🔥
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Produk Pilihan Mahasiswa
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
              Temukan berbagai produk menarik dari sesama mahasiswa. Kualitas terjamin, harga kantong mahasiswa!
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {[1, 2, 3, 4].map(n => (
                <div key={n} style={{ background: 'white', borderRadius: 20, height: 350, animation: 'pulse 1.5s infinite', background: '#e2e8f0' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {products.map(p => (
                <div key={p.id} style={{ 
                  background: 'rgba(255, 255, 255, 0.7)', 
                  backdropFilter: 'blur(20px)',
                  borderRadius: 24, 
                  overflow: 'hidden', 
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', 
                  border: '1px solid rgba(255,255,255,0.8)', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  cursor: 'pointer',
                  position: 'relative'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-8px)'; e.currentTarget.style.boxShadow='0 20px 40px -10px rgba(99,102,241,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 10px 40px -10px rgba(0,0,0,0.08)' }}>
                  
                  <div style={{ height: 220, background: '#f1f5f9', position: 'relative', padding: '1rem' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                      {p.gambar ? <Image src={p.gambar} alt={p.nama_produk} fill style={{ objectFit: 'cover' }} unoptimized />
                        : <div style={{ height: '100%', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📦</div>}
                    </div>
                    
                    <div style={{ 
                      position: 'absolute', top: 24, right: 24, 
                      background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                      color: p.stok > 0 ? '#10b981' : '#ef4444', 
                      padding: '0.4rem 0.8rem', borderRadius: 50, 
                      fontSize: '0.75rem', fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {p.stok > 0 ? 'Tersedia' : 'Habis'}
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800 }}>
                        {p.user_accounts?.nama?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, margin: 0 }}>
                        {p.user_accounts?.nama || 'Penjual'}
                      </p>
                    </div>

                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.4, height: '2.8em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {p.nama_produk}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem', fontWeight: 600 }}>Harga</p>
                        <p style={{ fontWeight: 800, fontSize: '1.25rem', color: '#6366f1', margin: 0 }}>{fmt(p.harga)}</p>
                      </div>
                      <Link href="/login" style={{
                        width: 40, height: 40, borderRadius: 12, 
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                        <ShoppingCart size={18}/>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {products.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <Link href="/login" style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontWeight: 700, color: '#0f172a', textDecoration: 'none', fontSize: '1.1rem',
                padding: '1rem 2.5rem', background: 'white', borderRadius: 50,
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.transform='translateY(0)' }}>
                Lihat Semua Produk <span style={{ color: '#6366f1' }}>→</span>
              </Link>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Features Section */}
      <section style={{ padding: '5rem 0', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
            Kenapa Catalog Students?
          </h2>
          <p style={{ color: '#64748b', marginBottom: '3.5rem', fontSize: '1.1rem' }}>
            Platform marketplace khusus mahasiswa dengan fitur lengkap
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { icon: <ShoppingBag size={28} />, title: 'Belanja Mudah', desc: 'Temukan produk unik dari sesama mahasiswa dengan harga terjangkau.' },
              { icon: <Store size={28} />, title: 'Jual Produk', desc: 'Buka toko dan mulai berjualan produkmu kepada ribuan mahasiswa.' },
              { icon: <BookOpen size={28} />, title: 'Aman & Terpercaya', desc: 'Sistem terverifikasi untuk memastikan transaksi kamu tetap aman.' },
            ].map((f, i) => (
              <div key={i} style={{
                background: '#f8fafc', borderRadius: 16,
                padding: '2rem', border: '1px solid #e2e8f0',
                transition: 'all 0.2s', textAlign: 'left'
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', marginBottom: '1.25rem'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        padding: '5rem 1.5rem', textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          Siap Bergabung?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          Daftarkan akunmu sekarang dan mulai jual-beli produk kreatif!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/register" style={{
            background: 'white', color: '#6366f1',
            fontWeight: 700, padding: '1rem 2.5rem',
            borderRadius: '50px', textDecoration: 'none', fontSize: '1rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}>
            Daftar Sekarang
          </Link>
          <Link href="/login" style={{
            background: 'transparent', color: 'white',
            fontWeight: 700, padding: '1rem 2.5rem',
            borderRadius: '50px', textDecoration: 'none', fontSize: '1rem',
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            Login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        © 2025 Catalog Students — Student Marketplace
      </footer>
    </>
  );
}
