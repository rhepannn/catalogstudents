'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, MessageSquare } from 'lucide-react'

const fmt = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export default function ChatPage() {
  const [contacts, setContacts] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [realtimeStatus, setRealtimeStatus] = useState('connecting')
  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)

  // Get current user from session info (API call)
  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => setCurrentUser(d.user))
    fetch('/api/contacts').then(r => r.json()).then(d => setContacts(d.contacts || []))
  }, [])

  const fetchMessages = useCallback(async (withId) => {
    if (!withId) return
    const res = await fetch(`/api/chat?with=${withId}`)
    const data = await res.json()
    setMessages(data.messages || [])
  }, [])

  useEffect(() => {
    if (!selected) return
    fetchMessages(selected.id)

    // Remove old channel
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`chat-${selected.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      }, (payload) => {
        const msg = payload.new
        if (
          (msg.pengirim_id === currentUser?.user_id && msg.penerima_id === selected.id) ||
          (msg.penerima_id === currentUser?.user_id && msg.pengirim_id === selected.id)
        ) {
          setMessages(prev => [...prev, msg])
        }
      })
      .subscribe((status) => setRealtimeStatus(status))

    channelRef.current = channel
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [selected, fetchMessages, currentUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !selected || sending) return
    setSending(true)
    const msg = text.trim()
    setText('')
    
    // Optimistic UI update
    const tempMsg = {
      id: 'temp-' + Date.now(),
      pengirim_id: currentUser?.user_id,
      penerima_id: selected.id,
      pesan: msg,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ penerima_id: selected.id, pesan: msg })
    })
    
    // Fetch actual data to replace temp and ensure sync
    await fetchMessages(selected.id)
    setSending(false)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      {/* Contacts Sidebar */}
      <div style={{ width: 300, background: 'white', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', margin: 0 }}>💬 Pesan</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>Chat realtime dengan penjual/pembeli</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {contacts.map(c => (
            <button key={c.id} onClick={() => setSelected(c)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem 1.25rem', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: selected?.id === c.id ? '#ede9fe' : 'transparent',
              borderLeft: selected?.id === c.id ? '3px solid #6366f1' : '3px solid transparent',
              transition: 'all 0.15s'
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {c.nama?.[0]?.toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nama}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.role}</div>
              </div>
            </button>
          ))}
          {contacts.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>Tidak ada kontak</p>}
        </div>
      </div>

      {/* Chat Window */}
      {selected ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ background: 'white', padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {selected.nama?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selected.nama}</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981' }}>● Online</div>
              </div>
            </div>
            <span style={{ background: realtimeStatus === 'SUBSCRIBED' ? '#ecfdf5' : '#fef3c7', color: realtimeStatus === 'SUBSCRIBED' ? '#10b981' : '#d97706', padding: '0.3rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>
              {realtimeStatus === 'SUBSCRIBED' ? '⚡ Realtime' : 'Connecting...'}
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.length === 0 && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8' }}>
                <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>Mulai percakapan!</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.pengirim_id === currentUser?.user_id
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%', padding: '0.75rem 1rem', borderRadius: 18,
                    background: isMe ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'white',
                    color: isMe ? 'white' : '#0f172a',
                    borderBottomRightRadius: isMe ? 4 : 18, borderBottomLeftRadius: isMe ? 18 : 4,
                    boxShadow: isMe ? '0 4px 12px rgba(99,102,241,0.3)' : '0 1px 3px rgba(0,0,0,0.08)'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', wordBreak: 'break-word' }}>{msg.pesan}</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', opacity: 0.65, textAlign: 'right' }}>{fmt(msg.created_at)}</p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{ background: 'white', padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem' }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Pesan ke ${selected.nama}...`} style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: 50, outline: 'none', fontSize: '0.9rem' }} />
            <button type="submit" disabled={!text.trim() || sending} style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: !text.trim() || sending ? 0.5 : 1, transition: 'opacity 0.2s'
            }}>
              <Send size={16}/>
            </button>
          </form>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8' }}>
          <MessageSquare size={72} style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
          <h3 style={{ color: '#64748b', fontWeight: 700, margin: 0 }}>Pilih Percakapan</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Pilih kontak di sebelah kiri untuk mulai chat</p>
        </div>
      )}
    </div>
  )
}
