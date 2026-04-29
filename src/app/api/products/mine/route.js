import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

// GET — produk milik seller yang sedang login
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'penjual')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServerSupabase()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('penjual_id', session.user_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data })
}
