'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Cloud, Lock, Mail, User, Rocket, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTimeGradient } from '@/components/providers/time-gradient-provider'
import { TimeGradientBadge } from '@/components/time-gradient-selector'

export default function SignupPage() {
    const router = useRouter()
    const [supabase] = useState(() => createClient())
    const { timeTheme } = useTimeGradient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const handleSignup = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: typeof location !== 'undefined' ? `${location.origin}/auth/callback` : '',
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (error) {
                setError(error.message)
            } else {
                setMessage('Account created successfully! Redirecting...')
                setTimeout(() => {
                    router.push('/')
                    router.refresh()
                }, 1000)
            }
        } catch (err) {
            console.error('Signup error:', err)
            setError(err.message || 'Failed to connect to authentication server.')
        } finally {
            setLoading(false)
        }
    }

    const handleDemoSignup = async () => {
        setLoading(true)
        await supabase.auth.signUp({
            email: email || 'demo@nimbusvault.com',
            password: password || 'demopassword',
            options: { data: { full_name: fullName || 'Demo User' } },
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
                <div className={`absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-[140px] transition-all duration-1000 ${timeTheme.lightOrb2}`} />
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
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                        Start storing and organizing your encrypted vault files
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 px-8">
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" style={{ color: timeTheme.accentColor }} /> Full Name
                            </label>
                            <Input
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl"
                                required
                            />
                        </div>

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
                                    onClick={handleDemoSignup}
                                    className="w-full text-xs border-rose-300 dark:border-rose-700 rounded-xl"
                                >
                                    Create Demo Account instead
                                </Button>
                            </div>
                        )}

                        {message && <p className="text-emerald-500 font-semibold text-xs text-center">{message}</p>}

                        <Button
                            type="submit"
                            className={`w-full ${timeTheme.buttonGradient} ${timeTheme.buttonHover} text-white font-bold h-11 rounded-xl shadow-lg transition-all duration-500`}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
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
                        onClick={handleDemoSignup}
                        disabled={loading}
                    >
                        <Rocket className="w-4 h-4" style={{ color: timeTheme.accentColor }} /> Continue with Instant Demo Account
                    </Button>
                </CardContent>

                <CardFooter className="flex justify-center pb-8 pt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="underline font-bold transition-colors"
                            style={{ color: timeTheme.accentColor }}
                        >
                            Sign In
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
