import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { nama, email, password, role } = await request.json()

    if (!nama || !email || !password || !role)
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })

    if (!['pembeli', 'penjual'].includes(role))
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 })

    const db = createServerSupabase()

    // Check email already exists
    const { data: existing } = await db.from('user_accounts').select('id').eq('email', email).single()
    if (existing) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })

    const hashedPassword = await bcrypt.hash(password, 10)
    const { data, error } = await db
      .from('user_accounts')
      .insert({ nama, email, password: hashedPassword, role })
      .select('id, nama, email, role')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, user: data })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
