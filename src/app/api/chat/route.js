import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

// GET — fetch messages between current user and another user
export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const withUserId = parseInt(searchParams.get('with'))
  if (!withUserId) return NextResponse.json({ error: 'Missing ?with param' }, { status: 400 })

  const db = createServerSupabase()
  const userId = session.user_id

  const { data, error } = await db
    .from('chat_messages')
    .select('*, sender:user_accounts!pengirim_id(nama)')
    .or(`and(pengirim_id.eq.${userId},penerima_id.eq.${withUserId}),and(pengirim_id.eq.${withUserId},penerima_id.eq.${userId})`)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mark messages as read
  await db.from('chat_messages').update({ dibaca: true })
    .eq('penerima_id', userId).eq('pengirim_id', withUserId).eq('dibaca', false)

  return NextResponse.json({ messages: data })
}

// POST — send a message
export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { penerima_id, pesan } = await request.json()
  if (!penerima_id || !pesan?.trim()) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const db = createServerSupabase()
  const { data, error } = await db
    .from('chat_messages')
    .insert({ pengirim_id: session.user_id, penerima_id: parseInt(penerima_id), pesan: pesan.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data })
}
