import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request) {
  try {
    const data = await request.formData()
    const file = data.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Create unique filename
    const ext = file.name.split('.').pop()
    const filename = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`
    const filepath = path.join(uploadDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    return NextResponse.json({ success: true, url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
