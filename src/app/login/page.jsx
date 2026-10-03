'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Cloud, Lock, Mail, Rocket, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTimeGradient } from '@/components/providers/time-gradient-provider'
import { TimeGradientBadge } from '@/components/time-gradient-selector'

export default function LoginPage() {
    const router = useRouter()
    const [supabase] = useState(() => createClient())
    const { timeTheme } = useTimeGradient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('Login error:', error)
                setError(error.message)
                setLoading(false)
                return
            }

            router.push('/')
            router.refresh()
        } catch (err) {
            console.error('Login exception:', err)
            setError(err.message || 'Failed to connect to authentication server.')
            setLoading(false)
        }
    }

    const handleDemoLogin = async () => {
        setLoading(true)
        await supabase.auth.signInWithPassword({
            email: email || 'demo@nimbusvault.com',
            password: 'demopassword',
            isDemo: true
        })
        router.push('/')
        router.refresh()
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 relative overflow-hidden transition-colors duration-1000">
            {/* Background Ambient Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[130px] transition-all duration-1000 ${timeTheme.lightOrb1}`} />
                <div className={`absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full blur-[140px] transition-all duration-1000 ${timeTheme.lightOrb2}`} />
            </div>

            <div className="relative z-10 w-full max-w-md mb-4 flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <TimeGradientBadge />
            </div>

            <Card className="w-full max-w-md shadow-2xl border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl relative z-10 overflow-hidden transition-all duration-1000">
                <CardHeader className="text-center pt-8 pb-4">
                    <div className={`w-14 h-14 ${timeTheme.buttonGradient} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl transition-all duration-1000`}>
                        <Cloud className="w-8 h-8" />
                    </div>
                    <CardTitle className={`text-3xl font-extrabold bg-gradient-to-r ${timeTheme.textGradient} bg-clip-text text-transparent transition-all duration-1000`}>
                        NimbusVault
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                        Sign in to access your encrypted cloud files
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 px-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" style={{ color: timeTheme.accentColor }} /> Email Address
                            </label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" style={{ color: timeTheme.accentColor }} /> Password
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs space-y-2">
                                <p>{error}</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDemoLogin}
                                    className="w-full text-xs border-rose-300 dark:border-rose-700 rounded-xl"
                                >
                                    Login with 1-Click Demo Mode instead
                                </Button>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className={`w-full ${timeTheme.buttonGradient} ${timeTheme.buttonHover} text-white font-bold h-11 rounded-xl shadow-lg transition-all duration-500`}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold">Or Quick Access</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-11 font-semibold gap-2 transition-all"
                        onClick={handleDemoLogin}
                        disabled={loading}
                    >
                        <Rocket className="w-4 h-4" style={{ color: timeTheme.accentColor }} /> Continue with Instant Demo Mode
                    </Button>
                </CardContent>

                <CardFooter className="flex justify-center pb-8 pt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/signup"
                            className="underline font-bold transition-colors"
                            style={{ color: timeTheme.accentColor }}
                        >
                            Create Account
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
