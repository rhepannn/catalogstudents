import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

// Returns list of users to chat with (opposite role)
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServerSupabase()
  const oppositeRole = session.role === 'penjual' ? 'pembeli' : 'penjual'

  const { data, error } = await db
    .from('user_accounts')
    .select('id, nama, role')
    .eq('role', oppositeRole)
    .order('nama')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ contacts: data })
}
