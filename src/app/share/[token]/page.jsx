'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FileIcon, Download, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'

export default function SharePage() {
    const params = useParams()
    const token = params.token

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [metadata, setMetadata] = useState(null)
    const [password, setPassword] = useState('')
    const [downloading, setDownloading] = useState(false)
    const [passwordError, setPasswordError] = useState(null)

    useEffect(() => {
        if (!token) return

        const fetchMetadata = async () => {
            try {
                const res = await fetch(`/api/share/${token}`)
                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to load share')
                }

                setMetadata(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchMetadata()
    }, [token])

    const handleDownload = async (e) => {
        e.preventDefault()
        setDownloading(true)
        setPasswordError(null)

        try {
            const res = await fetch('/api/share/access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            })

            const data = await res.json()

            if (!res.ok) {
                if (res.status === 401) {
                    setPasswordError('Incorrect password')
                } else {
                    throw new Error(data.error || 'Download failed')
                }
                return
            }

            // Trigger download
            const link = document.createElement('a')
            link.href = data.downloadUrl
            link.download = metadata.fileName
            document.body.appendChild(link)
            link.click()
            link.remove()

        } catch (err) {
            console.error(err)
            // If generalized error, maybe show it
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md border-red-200">
                    <CardHeader>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-red-900">Link Unavailable</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>Try Again</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="mb-8 flex items-center gap-2">
                <div className="bg-orange-500 p-2 rounded-lg">
                    {/* Cloud Icon SVG manually or import if layout allows, but this is a page.jsx so importing allowed*/}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6 text-white"
                    >
                        <path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19" />
                        <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
                        <line x1="8" y1="16" x2="8.01" y2="16" />
                        <line x1="8" y1="20" x2="8.01" y2="20" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                        <line x1="12" y1="22" x2="12.01" y2="22" />
                        <line x1="16" y1="16" x2="16.01" y2="16" />
                        <line x1="16" y1="20" x2="16.01" y2="20" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">NimbusVault</span>
            </div>

            <Card className="w-full max-w-md shadow-lg border-gray-100">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl break-all">{metadata.fileName}</CardTitle>
                    <CardDescription>
                        Shared with you • {metadata.expiresAt ? `Expires ${format(new Date(metadata.expiresAt), 'PP')}` : 'No expiration'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                    {metadata.isPasswordProtected ? (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5" />
                                    Password Required
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Enter access password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={passwordError ? "border-red-500" : ""}
                                />
                                {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-500 p-2 bg-gray-50 rounded-lg">
                            This file is publicly accessible via this link.
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11"
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        {downloading ? 'Verifying...' : 'Download File'}
                    </Button>
                </CardFooter>
            </Card>

            <p className="mt-8 text-xs text-center text-gray-400">
                Powered by NimbusVault Secure Sharing
            </p>
        </div>
    )
}
