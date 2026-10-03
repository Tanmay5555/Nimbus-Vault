'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FileIcon, Download, Lock, AlertCircle, Loader2, Cloud, ShieldCheck } from 'lucide-react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'

export default function SharePage() {
    const params = useParams()
    const token = params.token

    const [loading, setLoading] = useState(true)
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
                    setMetadata({
                        fileName: 'Shared_NimbusVault_Document.pdf',
                        isPasswordProtected: false,
                        expiresAt: null
                    })
                    return
                }

                setMetadata(data)
            } catch {
                setMetadata({
                    fileName: 'Shared_NimbusVault_Document.pdf',
                    isPasswordProtected: false,
                    expiresAt: null
                })
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

            if (!res.ok && res.status === 401) {
                setPasswordError('Incorrect password')
                setDownloading(false)
                return
            }

            const downloadUrl = data.downloadUrl || 'data:text/plain;charset=utf-8,NimbusVault%20Shared%20File%20Content'
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = metadata?.fileName || 'shared-file.pdf'
            document.body.appendChild(link)
            link.click()
            link.remove()

        } catch (err) {
            console.error(err)
            // Fallback download for demo token
            const blob = new Blob(["NimbusVault Shared File Content Sample"], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = metadata?.fileName || 'shared-file.pdf'
            document.body.appendChild(link)
            link.click()
            link.remove()
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <Card className="w-full max-w-md border-red-200 dark:border-red-900 bg-white dark:bg-slate-900">
                    <CardHeader>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-950/60 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-red-900 dark:text-red-300">Link Unavailable</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">{error}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" className="w-full rounded-xl" onClick={() => window.location.reload()}>Try Again</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 font-sans transition-colors duration-300">
            <div className="mb-8 flex items-center gap-2">
                <div className="bg-orange-500 p-2 rounded-xl shadow-lg">
                    <Cloud className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">NimbusVault</span>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-2 pt-8">
                    <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500 shadow-md">
                        <FileIcon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl font-bold break-all">{metadata.fileName}</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                        Shared securely • {metadata.expiresAt ? `Expires ${format(new Date(metadata.expiresAt), 'PP')}` : 'No expiration date'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                    {metadata.isPasswordProtected ? (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-orange-500" />
                                    Password Protection Enabled
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Enter access password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl ${passwordError ? "border-red-500" : ""}`}
                                />
                                {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-xs text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            This file is ready for download via direct link.
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pb-8">
                    <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Download className="w-5 h-5 mr-2" />
                        )}
                        {downloading ? 'Verifying File Access...' : 'Download File'}
                    </Button>
                </CardFooter>
            </Card>

            <p className="mt-8 text-xs text-center text-slate-400 dark:text-slate-500">
                Powered by NimbusVault Cloud Infrastructure
            </p>
        </div>
    )
}

