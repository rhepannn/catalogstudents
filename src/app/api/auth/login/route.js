import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const db = createServerSupabase();

    // Ambil data user dari Supabase
    const { data: user, error } = await db
      .from('user_accounts')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Email tidak terdaftar' }, { status: 401 });
    }

    // Verifikasi password (cocok dengan hash PHP password_hash)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Password salah' }, { status: 401 });
    }

    // Buat data session
    const sessionData = {
      user_id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role
    };

    const sessionToken = await encrypt(sessionData);

    const response = NextResponse.json({ success: true, user: sessionData });
    
    // Set HTTP-only cookie untuk keamanan
    response.cookies.set({
      name: 'session',
      value: sessionToken,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 // 24 jam
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
