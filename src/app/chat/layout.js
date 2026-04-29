import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import BuyerSidebar from '@/components/BuyerSidebar'
import SellerSidebar from '@/components/SellerSidebar'

export default async function ChatLayout({ children }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {session.role === 'pembeli' ? (
        <BuyerSidebar user={session} />
      ) : (
        <SellerSidebar user={session} />
      )}
      <main style={{ marginLeft: 255, flex: 1, background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}
