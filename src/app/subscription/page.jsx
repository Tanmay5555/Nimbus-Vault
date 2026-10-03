'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, Sparkles, Shield, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { useToast } from '@/components/ui/toast'

export default function SubscriptionPage() {
    const router = useRouter()
    const { addToast } = useToast()
    const [billingCycle, setBillingCycle] = useState('monthly')
    const [upgradingPlan, setUpgradingPlan] = useState(null)

    const plans = [
        {
            name: 'Free',
            price: 0,
            features: ['10 GB Storage', 'Basic Support', 'Single User', 'Standard Speed'],
            current: true,
            popular: false,
            icon: Shield
        },
        {
            name: 'Pro',
            price: billingCycle === 'monthly' ? 899 : 749,
            features: ['1 TB Storage', 'Priority Support', '5 Users', 'High Speed', 'Advanced Security', 'File Recovery (30 days)'],
            current: false,
            popular: true,
            icon: Zap
        },
        {
            name: 'Business',
            price: billingCycle === 'monthly' ? 2499 : 1999,
            features: ['Unlimited Storage', '24/7 Dedicated Support', 'Unlimited Users', 'Ultra Speed', 'SSO & Audit Logs', 'File Recovery (Unlimited)'],
            current: false,
            popular: false,
            icon: Sparkles
        }
    ]

    const handleUpgrade = (planName) => {
        const saved = localStorage.getItem('paymentMethods')
        const cards = saved ? JSON.parse(saved) : []
        
        if (cards.length === 0) {
            addToast('Please add a payment method in Billing first', 'warning')
            setTimeout(() => router.push('/billing'), 1200)
            return
        }

        setUpgradingPlan(planName)
        setTimeout(() => {
            setUpgradingPlan(null)
            addToast(`Successfully upgraded to ${planName} Plan!`, 'success')
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-8 gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-900"
                    onClick={() => router.push('/')}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>

                <div className="text-center mb-12">
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                        Flexible Pricing
                    </span>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mt-3 mb-4">Choose Your Storage Plan</h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base">
                        Unlock high-capacity storage, advanced AI capabilities, and end-to-end file encryption.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mt-8 gap-4">
                        <span className={cn("text-sm font-semibold", billingCycle === 'monthly' ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400")}>Monthly</span>
                        <button
                            className="w-14 h-7 bg-orange-500 rounded-full p-1 relative transition-colors focus:outline-none shadow-inner"
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        >
                            <div className={cn("w-5 h-5 bg-white rounded-full transition-transform shadow-md", billingCycle === 'yearly' ? "translate-x-7" : "")} />
                        </button>
                        <span className={cn("text-sm font-semibold flex items-center gap-1.5", billingCycle === 'yearly' ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400")}>
                            Yearly <span className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-xs px-2 py-0.5 rounded-full font-bold">Save 20%</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan) => {
                        const IconComponent = plan.icon
                        return (
                            <div key={plan.name} className={cn(
                                "bg-white dark:bg-slate-900 rounded-3xl p-8 border shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                                plan.popular ? "border-orange-500 dark:border-orange-500 ring-4 ring-orange-500/10 shadow-2xl scale-105 z-10" : "border-slate-200 dark:border-slate-800"
                            )}>
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl shadow-md">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center text-orange-500 mb-4 border border-orange-200 dark:border-orange-800/40">
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{plan.name}</h3>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">₹{plan.price}</span>
                                        {plan.price > 0 && <span className="text-slate-500 dark:text-slate-400 ml-1.5 font-medium">/month</span>}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Billed {billingCycle}</p>
                                </div>

                                <ul className="space-y-3.5 mb-8 flex-1 border-t border-slate-100 dark:border-slate-800/80 pt-6">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="p-0.5 bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 rounded-full mt-0.5">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={cn(
                                        "w-full h-12 font-bold rounded-xl shadow-sm transition-all",
                                        plan.current
                                            ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default"
                                            : plan.popular
                                                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 shadow-lg"
                                                : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white"
                                    )}
                                    disabled={plan.current || upgradingPlan === plan.name}
                                    onClick={() => handleUpgrade(plan.name)}
                                >
                                    {plan.current ? 'Current Active Plan' : upgradingPlan === plan.name ? 'Upgrading...' : `Upgrade to ${plan.name}`}
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

