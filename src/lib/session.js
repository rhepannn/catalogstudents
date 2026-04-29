import { cookies } from 'next/headers'
import { decrypt } from './auth'

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return await decrypt(token)
}
