'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Box, PlusCircle, ShoppingBag, Users, MessageSquare, Home, LogOut, Store } from 'lucide-react'

const S = {
  sidebar: {
    width: 255, background: 'linear-gradient(180deg, #4338ca 0%, #6366f1 100%)',
    color: 'white', position: 'fixed', top: 0, bottom: 0, left: 0,
    display: 'flex', flexDirection: 'column', zIndex: 50, overflowY: 'auto',
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
  },
  brand: { padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: '0.75rem' },
  brandIcon: { width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandText: { lineHeight: 1.2 },
  user: { padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' },
  avatar: { width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 },
  navLabel: { padding: '0.75rem 1.5rem 0.25rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, margin: 0 },
}

function NavItem({ href, icon, label, active, badge }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between',
      padding: '0.75rem 1.5rem', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem',
      color: active ? 'white' : 'rgba(255,255,255,0.7)',
      background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
      borderLeft: active ? '3px solid white' : '3px solid transparent',
      transition: 'all 0.15s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {icon}
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span style={{ background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: 50 }}>
          {badge}
        </span>
      )}
    </Link>
  )
}

export default function SellerSidebar({ user }) {
  const pathname = usePathname()
  const router = useRouter()
  const [unreadChat, setUnreadChat] = useState(0)

  useEffect(() => {
    const fetchUnread = () => {
      fetch('/api/chat/unread')
        .then(r => r.json())
        .then(d => setUnreadChat(d.unread || 0))
        .catch(() => {})
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const navItems = [
    { href: '/penjual/dashboard', icon: <LayoutDashboard size={17}/>, label: 'Dashboard' },
    { href: '/penjual/produk', icon: <Box size={17}/>, label: 'Produk Saya' },
    { href: '/penjual/tambah-produk', icon: <PlusCircle size={17}/>, label: 'Tambah Produk' },
    { href: '/penjual/pesanan', icon: <ShoppingBag size={17}/>, label: 'Pesanan Masuk' },
    { href: '/penjual/pelanggan', icon: <Users size={17}/>, label: 'Daftar Pelanggan' },
    { href: '/chat', icon: <MessageSquare size={17}/>, label: 'Chat Pembeli', badge: unreadChat },
  ]

  return (
    <aside style={S.sidebar}>
      <div style={S.brand}>
        <div style={S.brandIcon}><Store size={20}/></div>
        <div style={S.brandText}>
          <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>Seller</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Central</div>
        </div>
      </div>

      {user && (
        <div style={S.user}>
          <div style={S.avatar}>{user.nama?.[0]?.toUpperCase() || 'S'}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.nama}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Student Merchant</div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1 }}>
        <p style={S.navLabel}>Manajemen Toko</p>
        {navItems.map(item => (
          <NavItem key={item.href} {...item} active={pathname === item.href || pathname.startsWith(item.href + '/')} />
        ))}
        <p style={{ ...S.navLabel, marginTop: '1rem' }}>Sistem</p>
        <NavItem href="/" icon={<Home size={17}/>} label="Kembali ke Home" active={false} />
      </nav>

      <button onClick={logout} style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '1rem 1.5rem', background: 'rgba(239,68,68,0.15)',
        color: '#fca5a5', border: 'none', cursor: 'pointer',
        width: '100%', fontWeight: 600, fontSize: '0.9rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <LogOut size={17}/> Logout
      </button>
    </aside>
  )
}
