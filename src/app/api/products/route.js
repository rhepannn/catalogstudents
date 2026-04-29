import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

// GET — list products (with optional seller filter)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sellerId = searchParams.get('seller_id')
  const db = createServerSupabase()

  let query = db
    .from('products')
    .select('*, user_accounts(nama)')
    .order('created_at', { ascending: false })

  if (sellerId) query = query.eq('penjual_id', sellerId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data })
}

// POST — create product (seller only)
export async function POST(request) {
  const session = await getSession()
  if (!session || session.role !== 'penjual')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { nama_produk, deskripsi, harga, stok, gambar } = body

  if (!nama_produk || !harga)
    return NextResponse.json({ error: 'nama_produk dan harga wajib diisi' }, { status: 400 })

  const db = createServerSupabase()
  const { data, error } = await db
    .from('products')
    .insert({ penjual_id: session.user_id, nama_produk, deskripsi, harga: parseFloat(harga), stok: parseInt(stok) || 0, gambar })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}
