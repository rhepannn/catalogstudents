import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import BuyerSidebar from '@/components/BuyerSidebar'

export default async function PembelijLayout({ children }) {
  const session = await getSession()
  if (!session || session.role !== 'pembeli') redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <BuyerSidebar user={session} />
      <main style={{ marginLeft: 255, flex: 1, background: '#f8fafc', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
