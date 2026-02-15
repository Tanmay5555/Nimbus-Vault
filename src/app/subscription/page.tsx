'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, Star, Zap, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/utils/cn'

export default function SubscriptionPage() {
    const router = useRouter()
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

    const plans = [
        {
            name: 'Free',
            price: 0,
            features: ['10 GB Storage', 'Basic Support', 'Single User', 'Standard Speed'],
            current: true,
            popular: false
        },
        {
            name: 'Pro',
            price: billingCycle === 'monthly' ? 899 : 749,
            features: ['1 TB Storage', 'Priority Support', '5 Users', 'High Speed', 'Advanced Security', 'File Recovery (30 days)'],
            current: false,
            popular: true
        },
        {
            name: 'Business',
            price: billingCycle === 'monthly' ? 2499 : 1999,
            features: ['Unlimited Storage', '24/7 Dedicated Support', 'Unlimited Users', 'Ultra Speed', 'SSO & Audit Logs', 'File Recovery (Unlimited)'],
            current: false,
            popular: false
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-8 gap-2 text-gray-500 hover:text-gray-900"
                    onClick={() => router.push('/')}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Upgrade your storage to secure your files with advanced features and higher limits.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mt-8 gap-4">
                        <span className={cn("text-sm font-medium", billingCycle === 'monthly' ? "text-gray-900" : "text-gray-500")}>Monthly</span>
                        <button
                            className="w-12 h-6 bg-orange-500 rounded-full relative transition-colors focus:outline-none"
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        >
                            <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", billingCycle === 'yearly' && "translate-x-6")} />
                        </button>
                        <span className={cn("text-sm font-medium", billingCycle === 'yearly' ? "text-gray-900" : "text-gray-500")}>Yearly <span className="text-orange-500 text-xs">(Save 20%)</span></span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div key={plan.name} className={cn(
                            "bg-white rounded-3xl p-8 border shadow-sm flex flex-col relative overflow-hidden",
                            plan.popular ? "border-orange-500 ring-4 ring-orange-500/10 shadow-xl scale-105 z-10" : "border-gray-100"
                        )}>
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                                    {plan.price > 0 && <span className="text-gray-500 ml-1">/mo</span>}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Billed {billingCycle}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                                        <div className="p-0.5 bg-green-100 rounded-full mt-0.5">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={cn(
                                    "w-full h-11",
                                    plan.current
                                        ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                        : plan.popular
                                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                                            : "bg-gray-900 hover:bg-gray-800 text-white"
                                )}
                                disabled={plan.current}
                                onClick={() => {
                                    if (plan.current) return
                                    const saved = localStorage.getItem('paymentMethods')
                                    if (!saved || JSON.parse(saved).length === 0) {
                                        if (confirm("You need to add a payment method first. Go to Billing?")) {
                                            router.push('/billing')
                                        }
                                    } else {
                                        // Simulate processing
                                        const btn = document.activeElement as HTMLButtonElement
                                        const originalText = btn.innerText
                                        btn.innerText = "Processing..."
                                        btn.disabled = true
                                        setTimeout(() => {
                                            alert(`Successfully upgraded to ${plan.name} plan!`)
                                            btn.innerText = "Current Plan" // Visual update only for demo
                                            btn.disabled = true
                                            btn.classList.add('bg-gray-100', 'text-gray-900', 'hover:bg-gray-200')
                                            btn.classList.remove('bg-orange-500', 'hover:bg-orange-600', 'text-white')
                                        }, 2000)
                                    }
                                }}
                            >
                                {plan.current ? 'Current Plan' : 'Upgrade Now'}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
