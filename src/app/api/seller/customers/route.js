import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'penjual') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServerSupabase()

  // Find all products owned by this seller
  const { data: myProducts } = await db.from('products').select('id').eq('penjual_id', session.user_id)
  if (!myProducts || myProducts.length === 0) return NextResponse.json({ customers: [] })
  const myProductIds = myProducts.map(p => p.id)

  // Find all orders containing these products
  const { data: details, error } = await db.from('order_details')
    .select('jumlah, subtotal, orders(pembeli_id, created_at, user_accounts!pembeli_id(id, nama, email))')
    .in('produk_id', myProductIds)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aggregate by customer
  const customersMap = {}
  details.forEach(d => {
    if (!d.orders || !d.orders.user_accounts) return
    const buyer = d.orders.user_accounts
    if (!customersMap[buyer.id]) {
      customersMap[buyer.id] = {
        ...buyer,
        total_orders: 0,
        total_spent: 0,
        last_order_date: d.orders.created_at
      }
    }
    
    customersMap[buyer.id].total_orders += 1
    customersMap[buyer.id].total_spent += d.subtotal
    
    if (new Date(d.orders.created_at) > new Date(customersMap[buyer.id].last_order_date)) {
      customersMap[buyer.id].last_order_date = d.orders.created_at
    }
  })

  const customers = Object.values(customersMap).sort((a, b) => b.total_spent - a.total_spent)
  return NextResponse.json({ customers })
}
