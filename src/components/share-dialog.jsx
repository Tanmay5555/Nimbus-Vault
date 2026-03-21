'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Copy, Check, Lock, Clock } from "lucide-react"
import { cn } from "@/utils/cn"
import { useToast } from "@/components/ui/toast"
import { Switch } from "@/components/ui/switch" // We might need to create this if not exists, but assuming basicshadcn
import { Label } from "@/components/ui/label"

export function ShareDialog({ filePath, isOpen, onClose }) {
    const [password, setPassword] = useState('')
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
            addToast('Share link created!', 'success')
        } catch (error) {
            console.error(error)
            addToast(error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!generatedLink) return
        navigator.clipboard.writeText(generatedLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        addToast('Link copied to clipboard', 'success')
    }

    const reset = () => {
        setGeneratedLink(null)
        setPassword('')
        setExpiresAt(null)
        setIsPasswordEnabled(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share File</DialogTitle>
                    <DialogDescription>
                        Create a unique link to share this file.
                    </DialogDescription>
                </DialogHeader>

                {!generatedLink ? (
                    <div className="space-y-6 py-4">
                        {/* Password Protection */}
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="password-mode" className="font-medium flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-gray-500" />
                                    Password Protection
                                </Label>
                                <span className="text-xs text-gray-500">Require a password to access</span>
                            </div>
                            <Switch
                                id="password-mode"
                                checked={isPasswordEnabled}
                                onCheckedChange={setIsPasswordEnabled}
                            />
                        </div>

                        {isPasswordEnabled && (
                            <div className="pl-6 border-l-2 border-gray-100 animate-in slide-in-from-top-2 fade-in">
                                <Input
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-gray-50"
                                />
                            </div>
                        )}

                        {/* Expiry Date */}
                        <div className="flex flex-col gap-3">
                            <Label className="font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                Expiration Date
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !expiresAt && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {expiresAt ? format(expiresAt, "PPP") : <span>Pick an expiry date (optional)</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-50 bg-white">
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
                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Check className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-green-900">Link Ready!</h3>
                            <p className="text-sm text-green-700 mt-1">Anyone with this link can view the file.</p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Input
                                value={generatedLink}
                                readOnly
                                className="bg-gray-50 font-mono text-xs"
                            />
                            <Button size="icon" onClick={copyToClipboard} className={cn("shrink-0", copied ? "bg-green-500 hover:bg-green-600" : "")}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                )}

                <DialogFooter className="sm:justify-end">
                    {!generatedLink ? (
                        <>
                            <Button type="button" variant="secondary" onClick={reset}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleCreateShare} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create Link
                            </Button>
                        </>
                    ) : (
                        <Button type="button" onClick={reset}>
                            Done
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
