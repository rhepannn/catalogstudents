import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServerSupabase()
  const { data, error } = await db.from('shopping_cart').select('*, products(*)').eq('pembeli_id', session.user_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cart: data })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const db = createServerSupabase()
  
  const { data: existing } = await db.from('shopping_cart').select('*').eq('pembeli_id', session.user_id).eq('produk_id', body.produk_id).single()
  
  if (existing) {
    const { data, error } = await db.from('shopping_cart').update({ jumlah: existing.jumlah + 1 }).eq('id', existing.id).select().single()
    return NextResponse.json({ success: true, item: data })
  } else {
    const { data, error } = await db.from('shopping_cart').insert({ pembeli_id: session.user_id, produk_id: body.produk_id, jumlah: body.jumlah || 1 }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, item: data })
  }
}

export async function DELETE(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const db = createServerSupabase()
  await db.from('shopping_cart').delete().eq('id', id).eq('pembeli_id', session.user_id)
  return NextResponse.json({ success: true })
}
