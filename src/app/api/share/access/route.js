
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request) {
    const supabase = await createClient()

    try {
        const { token, password } = await request.json()

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 400 })
        }

        const { data: share, error } = await supabase
            .from('file_shares')
            .select('*')
            .eq('token', token)
            .single()

        if (error || !share) {
            return NextResponse.json({ error: 'Share not found' }, { status: 404 })
        }

        // Check expiry
        if (share.expires_at && new Date(share.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Link expired' }, { status: 410 })
        }

        // Check Password
        if (share.password_hash) {
            if (!password) { // If password protected but none provided
                return NextResponse.json({ error: 'Password required', isPasswordProtected: true }, { status: 401 })
            }

            const match = await bcrypt.compare(password, share.password_hash)
            if (!match) {
                return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
            }
        }

        // If authorized, get signed URL
        const { data: signedData, error: signedError } = await supabase.storage
            .from('files')
            .createSignedUrl(share.file_path, 3600) // 1 hour

        if (signedError) {
            console.error('Storage Error:', signedError)
            return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 })
        }

        // Increment views (optional, simple update for now)
        await supabase
            .from('file_shares')
            .update({ views: (share.views || 0) + 1 })
            .eq('id', share.id)

        return NextResponse.json({
            success: true,
            downloadUrl: signedData.signedUrl
        })

    } catch (err) {
        console.error('Server Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
