import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import SellerSidebar from '@/components/SellerSidebar'

export default async function PenjualLayout({ children }) {
  const session = await getSession()
  if (!session || session.role !== 'penjual') redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SellerSidebar user={session} />
      <main style={{ marginLeft: 255, flex: 1, background: '#f8fafc', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
