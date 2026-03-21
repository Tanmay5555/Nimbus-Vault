
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { filePath, password, expiresAt } = await request.json()

        if (!filePath) {
            return NextResponse.json({ error: 'File path required' }, { status: 400 })
        }

        // Generate unique token (simple alphanumeric)
        const token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)

        let passwordHash = null
        if (password) {
            passwordHash = await bcrypt.hash(password, 10)
        }

        const { data, error } = await supabase
            .from('file_shares')
            .insert({
                user_id: user.id,
                file_path: filePath,
                token: token,
                password_hash: passwordHash,
                expires_at: expiresAt || null
            })
            .select()
            .single()

        if (error) {
            console.error('Database Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const shareUrl = `${new URL(request.url).origin}/share/${token}`

        return NextResponse.json({
            success: true,
            shareUrl,
            token
        })

    } catch (err) {
        console.error('Server Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
