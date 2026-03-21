
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
    // In Next.js 15+, params is a Promise. We must await it.
    const { token } = await params

    const supabase = await createClient()

    // Assuming public read access via RLS policy "Select by valid token"
    const { data: share, error } = await supabase
        .from('file_shares')
        .select('file_path, password_hash, expires_at, created_at')
        .eq('token', token)
        .single()

    if (error || !share) {
        return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    // Check expiry
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Link expired' }, { status: 410 })
    }

    const fileName = share.file_path.split('/').pop()

    return NextResponse.json({
        valid: true,
        fileName: fileName,
        isPasswordProtected: !!share.password_hash,
        expiresAt: share.expires_at
    })
}
