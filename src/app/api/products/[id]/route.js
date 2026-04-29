import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

// GET — fetch single product
export async function GET(request, { params }) {
  const db = createServerSupabase()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ product: data })
}

// PUT — update product
export async function PUT(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'penjual')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const db = createServerSupabase()

  const { data, error } = await db
    .from('products')
    .update({ ...body })
    .eq('id', params.id)
    .eq('penjual_id', session.user_id) // only own products
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}

// DELETE — delete product
export async function DELETE(request, { params }) {
  const session = await getSession()
  if (!session || session.role !== 'penjual')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServerSupabase()
  const { error } = await db
    .from('products')
    .delete()
    .eq('id', params.id)
    .eq('penjual_id', session.user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
