import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServerSupabase()
  
  const { data: cartItems } = await db.from('shopping_cart').select('*, products(*)').eq('pembeli_id', session.user_id)
  if (!cartItems || cartItems.length === 0) return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 })
  
  let totalHarga = 0
  cartItems.forEach(item => totalHarga += (item.jumlah * item.products.harga))
  
  // Create Order
  const { data: order, error: errOrder } = await db.from('orders').insert({
    pembeli_id: session.user_id,
    total_harga: totalHarga,
    status: 'pending'
  }).select().single()
  
  if (errOrder) return NextResponse.json({ error: errOrder.message }, { status: 500 })
  
  // Create Order Details
  const orderDetails = cartItems.map(item => ({
    pesanan_id: order.id,
    produk_id: item.produk_id,
    jumlah: item.jumlah,
    subtotal: item.jumlah * item.products.harga
  }))
  await db.from('order_details').insert(orderDetails)
  
  // Clear Cart
  await db.from('shopping_cart').delete().eq('pembeli_id', session.user_id)
  
  return NextResponse.json({ success: true, order_id: order.id })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServerSupabase()
  const { data } = await db.from('orders').select('*, order_details(*, products(*))').eq('pembeli_id', session.user_id).order('created_at', { ascending: false })
  return NextResponse.json({ orders: data })
}
