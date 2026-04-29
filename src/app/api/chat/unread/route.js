import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServerSupabase()
  
  // Count unread messages where current user is the receiver
  const { count, error } = await db
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('penerima_id', session.user_id)
    .eq('dibaca', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ unread: count || 0 })
}
