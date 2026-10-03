'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard, Plus, X, Loader2, Trash2, CheckCircle2, Download, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export default function BillingPage() {
    const router = useRouter()
    const { addToast } = useToast()
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [loading, setLoading] = useState(false)
    const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '', name: '' })
    
    const [savedCards, setSavedCards] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('paymentMethods')
            return saved ? JSON.parse(saved) : [
                { id: '1', name: 'Demo User', last4: '4242', expiry: '12/28', brand: 'Visa', primary: true }
            ]
        }
        return []
    })

    const handleAddCard = (e) => {
        e.preventDefault()
        if (!newCard.number || !newCard.expiry || !newCard.name) {
            addToast('Please fill out all card details', 'error')
            return
        }
        setLoading(true)

        setTimeout(() => {
            const createdCard = {
                id: Date.now().toString(),
                name: newCard.name,
                last4: newCard.number.slice(-4) || '8888',
                expiry: newCard.expiry,
                brand: newCard.number.startsWith('5') ? 'Mastercard' : 'Visa',
                primary: savedCards.length === 0
            }
            const newCards = [...savedCards, createdCard]
            setSavedCards(newCards)
            localStorage.setItem('paymentMethods', JSON.stringify(newCards))
            setNewCard({ number: '', expiry: '', cvc: '', name: '' })
            setIsAddingCard(false)
            setLoading(false)
            addToast('Payment method saved successfully!', 'success')
        }, 1200)
    }

    const handleDeleteCard = (cardId) => {
        const updated = savedCards.filter(c => c.id !== cardId)
        setSavedCards(updated)
        localStorage.setItem('paymentMethods', JSON.stringify(updated))
        addToast('Payment method removed', 'info')
    }

    const sampleInvoices = [
        { id: 'INV-2026-001', date: '2026-09-01', amount: '₹0.00', status: 'Paid', plan: 'Free Tier' },
        { id: 'INV-2026-002', date: '2026-08-01', amount: '₹0.00', status: 'Paid', plan: 'Free Tier' }
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-900"
                    onClick={() => router.push('/')}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Billing & Plans</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your billing details, payment methods, and invoices.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Plan Card */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
                                <CreditCard className="w-64 h-64" />
                            </div>
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                                    Active Account
                                </span>
                                <h2 className="text-3xl font-extrabold">Free Tier</h2>
                                <p className="text-orange-100 text-sm mt-1">10 GB Cloud Storage • Standard AI Assistant</p>
                            </div>
                            <Button
                                className="relative z-10 bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-md h-11 px-6 rounded-xl transition-transform hover:scale-105"
                                onClick={() => router.push('/subscription')}
                            >
                                Upgrade to Pro
                            </Button>
                        </div>

                        {/* Payment Method Section */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Payment Methods</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Cards saved for subscriptions & add-ons</p>
                                </div>
                                {!isAddingCard && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsAddingCard(true)}
                                        className="gap-2 border-slate-300 dark:border-slate-700 hover:border-orange-500 text-slate-700 dark:text-slate-300 rounded-xl"
                                    >
                                        <Plus className="w-4 h-4 text-orange-500" />
                                        Add Card
                                    </Button>
                                )}
                            </div>

                            {isAddingCard ? (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    {/* Visual Credit Card Preview */}
                                    <div className="w-full max-w-sm mx-auto h-48 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white p-6 shadow-2xl relative border border-slate-700 flex flex-col justify-between overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-mono tracking-widest text-slate-400">NIMBUSVAULT CARD</span>
                                            <span className="font-bold italic text-sm text-orange-400">{newCard.number.startsWith('5') ? 'Mastercard' : 'VISA'}</span>
                                        </div>
                                        <div className="my-2">
                                            <div className="w-10 h-7 bg-amber-400/80 rounded-md mb-2 flex items-center justify-center text-[10px] text-amber-950 font-bold">CHIP</div>
                                            <p className="font-mono text-lg sm:text-xl tracking-widest text-slate-200">
                                                {newCard.number ? newCard.number.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end text-xs uppercase text-slate-300">
                                            <div>
                                                <p className="text-[10px] text-slate-500">Card Holder</p>
                                                <p className="font-medium tracking-wide truncate max-w-[150px]">{newCard.name || 'YOUR NAME'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500">Expires</p>
                                                <p className="font-medium tracking-wide">{newCard.expiry || 'MM/YY'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add Card Form */}
                                    <form onSubmit={handleAddCard} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Enter Card Details</h4>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingCard(false)}><X className="w-4 h-4" /></Button>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Full Name on Card</label>
                                                <Input
                                                    placeholder="e.g. Alex Johnson"
                                                    value={newCard.name}
                                                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                                                    required
                                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Card Number</label>
                                                <Input
                                                    placeholder="16-digit card number"
                                                    value={newCard.number}
                                                    onChange={(e) => setNewCard({ ...newCard, number: e.target.value.replace(/\D/g, '') })}
                                                    maxLength={16}
                                                    required
                                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-1/2">
                                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Expiration Date</label>
                                                    <Input
                                                        placeholder="MM/YY"
                                                        value={newCard.expiry}
                                                        onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                                                        maxLength={5}
                                                        required
                                                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                                                    />
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">CVC</label>
                                                    <Input
                                                        placeholder="123"
                                                        type="password"
                                                        value={newCard.cvc}
                                                        onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value.replace(/\D/g, '') })}
                                                        maxLength={4}
                                                        required
                                                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button type="button" variant="ghost" onClick={() => setIsAddingCard(false)}>Cancel</Button>
                                            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 rounded-xl" disabled={loading}>
                                                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                                Save Payment Card
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            ) : savedCards.length > 0 ? (
                                <div className="space-y-3">
                                    {savedCards.map((card) => (
                                        <div key={card.id || card.last4} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-500/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <CreditCard className="w-6 h-6 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                        <span>•••• •••• •••• {card.last4}</span>
                                                        <span className="text-xs text-slate-400 font-normal">({card.brand || 'Visa'})</span>
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Expires {card.expiry} • {card.name || 'Cardholder'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {card.primary ? (
                                                    <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/60 border border-green-200 dark:border-green-800 px-3 py-1 rounded-full flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Primary
                                                    </span>
                                                ) : null}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                    onClick={() => handleDeleteCard(card.id)}
                                                    title="Delete card"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <CreditCard className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-slate-700 dark:text-slate-300">No payment method added</p>
                                            <p className="text-xs text-slate-400">Add a credit or debit card to upgrade your account.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Usage Summary Sidebar */}
                    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between border border-slate-800">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-orange-400" /> Storage Usage
                                </h3>
                                <span className="text-xs font-semibold bg-slate-800 text-orange-400 px-2.5 py-1 rounded-full border border-slate-700">12% Used</span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Total Cloud Storage</span>
                                        <span className="font-bold text-slate-200">1.2 GB / 10 GB</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2.5 p-0.5 border border-slate-700">
                                        <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Monthly Bandwidth</span>
                                        <span className="font-bold text-slate-200">450 MB / 50 GB</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2.5 p-0.5 border border-slate-700">
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '1%' }}></div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>Max file upload size</span>
                                        <span className="font-semibold text-slate-300">2 GB</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>Shared links active</span>
                                        <span className="font-semibold text-slate-300">3 Links</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <Button
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-xl h-11"
                                onClick={() => router.push('/subscription')}
                            >
                                Need more capacity?
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Billing History Section */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Billing & Receipt History</h3>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4">Invoice ID</th>
                                        <th className="px-6 py-4">Plan</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4 text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {sampleInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-slate-100">{inv.id}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{inv.plan}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{inv.date}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{inv.amount}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                                                    onClick={() => addToast(`Downloading invoice ${inv.id}...`, 'info')}
                                                >
                                                    <Download className="w-3.5 h-3.5" /> PDF
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

