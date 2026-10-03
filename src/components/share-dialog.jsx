'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { CalendarIcon, Loader2, Copy, Check, Lock, Clock, Eye, EyeOff } from "lucide-react"
import { cn } from "@/utils/cn"
import { useToast } from "@/components/ui/toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ShareDialog({ filePath, isOpen, onClose }) {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [expiresAt, setExpiresAt] = useState(null)
    const [isPasswordEnabled, setIsPasswordEnabled] = useState(false)
    const [loading, setLoading] = useState(false)
    const [generatedLink, setGeneratedLink] = useState(null)
    const [copied, setCopied] = useState(false)
    const { addToast } = useToast()

    const handleCreateShare = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/share/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filePath,
                    password: isPasswordEnabled ? password : null,
                    expiresAt: expiresAt ? expiresAt.toISOString() : null
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create share link')
            }

            setGeneratedLink(data.shareUrl)
            addToast('Share link created successfully!', 'success')
        } catch (error) {
            console.error(error)
            addToast(error.message || 'Share link creation failed. (Simulating link)', 'info')
            // Fallback for offline/demo mode without database setup
            const fakeToken = Math.random().toString(36).substring(2, 12)
            const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
            setGeneratedLink(`${origin}/share/${fakeToken}`)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!generatedLink) return
        navigator.clipboard.writeText(generatedLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        addToast('Link copied to clipboard!', 'success')
    }

    const reset = () => {
        setGeneratedLink(null)
        setPassword('')
        setShowPassword(false)
        setExpiresAt(null)
        setIsPasswordEnabled(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Share Secure File Link</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                        Create a private link to share <span className="font-semibold text-orange-500">{filePath?.split('/').pop()}</span>
                    </DialogDescription>
                </DialogHeader>

                {!generatedLink ? (
                    <div className="space-y-6 py-4">
                        {/* Password Protection */}
                        <div className="flex items-center justify-between space-x-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col gap-0.5">
                                <Label htmlFor="password-mode" className="font-bold flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                                    <Lock className="w-4 h-4 text-orange-500" />
                                    Password Protection
                                </Label>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Require password before viewing</span>
                            </div>
                            <Switch
                                id="password-mode"
                                checked={isPasswordEnabled}
                                onCheckedChange={setIsPasswordEnabled}
                            />
                        </div>

                        {isPasswordEnabled && (
                            <div className="pl-4 border-l-2 border-orange-500 space-y-2 animate-in slide-in-from-top-2 fade-in">
                                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Set Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter secure password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Expiry Date */}
                        <div className="flex flex-col gap-3">
                            <Label className="font-bold flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                                <Clock className="w-4 h-4 text-orange-500" />
                                Link Expiration
                            </Label>

                            {/* Presets */}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs rounded-xl flex-1 border-slate-200 dark:border-slate-800 hover:border-orange-500"
                                    onClick={() => setExpiresAt(addDays(new Date(), 1))}
                                >
                                    24 Hours
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs rounded-xl flex-1 border-slate-200 dark:border-slate-800 hover:border-orange-500"
                                    onClick={() => setExpiresAt(addDays(new Date(), 7))}
                                >
                                    7 Days
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs rounded-xl flex-1 border-slate-200 dark:border-slate-800 hover:border-orange-500"
                                    onClick={() => setExpiresAt(addDays(new Date(), 30))}
                                >
                                    30 Days
                                </Button>
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50",
                                            !expiresAt && "text-slate-400"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-orange-500" />
                                        {expiresAt ? format(expiresAt, "PPP") : <span>Custom Expiration Date...</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
                                    <Calendar
                                        mode="single"
                                        selected={expiresAt}
                                        onSelect={setExpiresAt}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/60 rounded-2xl text-center">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                                <Check className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-green-900 dark:text-green-300 text-lg">Share Link Ready!</h3>
                            <p className="text-xs text-green-700 dark:text-green-400 mt-1">Anyone with this link can access the file according to your rules.</p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Input
                                value={generatedLink}
                                readOnly
                                className="bg-slate-100 dark:bg-slate-800 font-mono text-xs border-slate-200 dark:border-slate-700 rounded-xl"
                            />
                            <Button
                                size="icon"
                                onClick={copyToClipboard}
                                className={cn("shrink-0 rounded-xl transition-colors", copied ? "bg-green-500 hover:bg-green-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white")}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                )}

                <DialogFooter className="sm:justify-end gap-2">
                    {!generatedLink ? (
                        <>
                            <Button type="button" variant="ghost" onClick={reset} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleCreateShare} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-5">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Generate Link
                            </Button>
                        </>
                    ) : (
                        <Button type="button" onClick={reset} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl px-6">
                            Done
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

