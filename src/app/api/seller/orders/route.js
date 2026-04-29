import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'penjual') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServerSupabase()
  
  // Find all products owned by this seller
  const { data: myProducts } = await db.from('products').select('id').eq('penjual_id', session.user_id)
  if (!myProducts || myProducts.length === 0) return NextResponse.json({ orders: [] })
  const myProductIds = myProducts.map(p => p.id)

  // Find all order_details containing these products, along with the order and buyer info
  const { data: details, error } = await db.from('order_details')
    .select('*, orders(*, user_accounts!pembeli_id(*)), products(*)')
    .in('produk_id', myProductIds)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by order
  const ordersMap = {}
  details.forEach(d => {
    if (!d.orders) return // skip if order somehow missing
    const oid = d.orders.id
    if (!ordersMap[oid]) {
      ordersMap[oid] = {
        ...d.orders,
        order_details: []
      }
    }
    ordersMap[oid].order_details.push(d)
  })

  // Convert to array and sort by created_at desc
  const orders = Object.values(ordersMap).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return NextResponse.json({ orders })
}

// Update order status
export async function PATCH(request) {
  const session = await getSession()
  if (!session || session.role !== 'penjual') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { order_id, status } = await request.json()
  const db = createServerSupabase()
  const { data, error } = await db.from('orders').update({ status }).eq('id', order_id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, order: data })
}
