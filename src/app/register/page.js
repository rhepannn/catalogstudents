'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ nama: '', email: '', password: '', role: 'pembeli' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess('Registrasi berhasil! Silakan login.')
      setTimeout(() => router.push('/login'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-overlay"></div>
      <div className="auth-card">
        <h1 className="auth-title">Buat Akun</h1>
        <p className="auth-subtitle">Bergabung di Catalog Students sekarang</p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <div className="floating-label">
              <input type="text" name="nama" id="nama" value={form.nama} onChange={handle} placeholder=" " required />
              <label htmlFor="nama">Nama Lengkap</label>
            </div>
          </div>
          <div className="form-group">
            <div className="floating-label">
              <input type="email" name="email" id="email" value={form.email} onChange={handle} placeholder=" " required />
              <label htmlFor="email">Email</label>
            </div>
          </div>
          <div className="form-group">
            <div className="floating-label">
              <input type="password" name="password" id="password" value={form.password} onChange={handle} placeholder=" " required />
              <label htmlFor="password">Password</label>
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>Daftar Sebagai</label>
            <select name="role" value={form.role} onChange={handle} style={{
              width: '100%', padding: '1rem 1.25rem', border: '2px solid #e2e8f0',
              borderRadius: 8, fontSize: '1rem', outline: 'none', background: '#f8fafc', appearance: 'none'
            }}>
              <option value="pembeli">👤 Pembeli</option>
              <option value="penjual">🏪 Penjual</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="auth-btn auth-btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="auth-link">
          Sudah punya akun? <Link href="/login">Login disini</Link>
        </div>
      </div>
    </div>
  )
}
