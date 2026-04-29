'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ShoppingCart, BookOpen, MessageSquare, Home, LogOut, ShoppingBag } from 'lucide-react'

const S = {
  sidebar: {
    width: 255, background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    color: 'white', position: 'fixed', top: 0, bottom: 0, left: 0,
    display: 'flex', flexDirection: 'column', zIndex: 50, overflowY: 'auto',
    boxShadow: '4px 0 24px rgba(0,0,0,0.2)'
  },
  brand: { padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem' },
  brandIcon: { width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  user: { padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.5rem' },
  avatar: { width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 },
  navLabel: { padding: '0.75rem 1.5rem 0.25rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4, margin: 0 },
}

function NavItem({ href, icon, label, active, badge }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between',
      padding: '0.75rem 1.5rem', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem',
      color: active ? 'white' : 'rgba(255,255,255,0.6)',
      background: active ? 'rgba(99,102,241,0.25)' : 'transparent',
      borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
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

export default function BuyerSidebar({ user }) {
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
    { href: '/pembeli/dashboard', icon: <LayoutDashboard size={17}/>, label: 'Dashboard' },
    { href: '/pembeli/katalog', icon: <BookOpen size={17}/>, label: 'Katalog Produk' },
    { href: '/pembeli/keranjang', icon: <ShoppingCart size={17}/>, label: 'Keranjang' },
    { href: '/pembeli/pesanan', icon: <ShoppingBag size={17}/>, label: 'Pesanan Saya' },
    { href: '/chat', icon: <MessageSquare size={17}/>, label: 'Chat Seller', badge: unreadChat },
  ]

  return (
    <aside style={S.sidebar}>
      <div style={S.brand}>
        <div style={S.brandIcon}><ShoppingBag size={18}/></div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>Catalog</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Students</div>
        </div>
      </div>

      {user && (
        <div style={S.user}>
          <div style={S.avatar}>{user.nama?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.nama}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Pembeli</div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1 }}>
        <p style={S.navLabel}>Menu</p>
        {navItems.map(item => (
          <NavItem key={item.href} {...item} active={pathname === item.href || pathname.startsWith(item.href + '/')} />
        ))}
        <p style={{ ...S.navLabel, marginTop: '1rem' }}>Lainnya</p>
        <NavItem href="/" icon={<Home size={17}/>} label="Kembali ke Home" active={false} />
      </nav>

      <button onClick={logout} style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '1rem 1.5rem', background: 'rgba(239,68,68,0.1)',
        color: '#fca5a5', border: 'none', cursor: 'pointer',
        width: '100%', fontWeight: 600, fontSize: '0.9rem',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <LogOut size={17}/> Logout
      </button>
    </aside>
  )
}
