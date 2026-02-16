'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Camera, ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function ProfilePage() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [fullName, setFullName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [updating, setUpdating] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
            setFullName(user.user_metadata?.full_name || '')
            setAvatarUrl(user.user_metadata?.avatar_url || null)
            setLoading(false)
        }
        getUser()
    }, [router, supabase])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)

        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        })

        if (error) {
            alert('Error updating profile')
            console.error(error)
        } else {
            alert('Profile updated successfully!')
        }
        setUpdating(false)
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }

        setUploading(true)
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('files')
            .upload(filePath, file)

        if (uploadError) {
            alert('Error uploading avatar!')
            console.error(uploadError)
            setUploading(false)
            return
        }

        // Get Public URL (assuming bucket is public, or use createSignedUrl)
        // For private buckets, we usually use getPublicUrl if the policy allows, or signed URLs.
        // Here assuming we can get a public URL or valid URL. 
        // Actually, for this 'files' bucket, let's try getPublicUrl.
        const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(filePath)

        // Update user metadata
        const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        })

        if (updateError) {
            alert('Error updating user avatar url')
            console.error(updateError)
        } else {
            setAvatarUrl(publicUrl)
            alert('Avatar updated!')
        }
        setUploading(false)
    }

    if (loading) {
        return <div className="h-screen flex items-center justify-center text-orange-500"><Loader2 className="animate-spin w-8 h-8" /></div>
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-8 gap-2 text-gray-500 hover:text-gray-900"
                    onClick={() => router.push('/')}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 text-white text-3xl font-bold">
                                        {(fullName?.[0] || user?.email?.[0])?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-10">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                            disabled={uploading}
                        />
                        <p className="mt-4 text-sm text-gray-500">Click to change profile picture</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <Input
                                value={user?.email || ''}
                                disabled
                                className="bg-gray-50 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11"
                                disabled={updating}
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
