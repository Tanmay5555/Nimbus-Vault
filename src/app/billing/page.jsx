'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard, Download, ExternalLink, Plus, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

export default function BillingPage() {
    const router = useRouter()
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [savedCards, setSavedCards] = useState<any[]>([])
    const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '', name: '' })
    const [loading, setLoading] = useState(false)

    // Load cards from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('paymentMethods')
            if (saved) {
                setSavedCards(JSON.parse(saved))
            }
        }
    }, [])

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            const newCards = [...savedCards, { ...newCard, last4: newCard.number.slice(-4) }]
            setSavedCards(newCards)
            localStorage.setItem('paymentMethods', JSON.stringify(newCards))
            setNewCard({ number: '', expiry: '', cvc: '', name: '' })
            setIsAddingCard(false)
            setLoading(false)
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-8 gap-2 text-gray-500 hover:text-gray-900"
                    onClick={() => router.push('/')}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Plans</h1>
                <p className="text-gray-500 mb-8">Manage your billing information and view your payment history.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="md:col-span-2 space-y-6">
                        {/* Current Plan Card */}
                        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-semibold text-orange-600 mb-1">Current Plan</p>
                                <h2 className="text-2xl font-bold text-gray-900">Free Plan</h2>
                                <p className="text-gray-600 text-sm mt-1">10 GB Storage • Basic Support</p>
                            </div>
                            <Button
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={() => router.push('/subscription')}
                            >
                                Upgrade Plan
                            </Button>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
                                {!isAddingCard && (
                                    <Button variant="outline" size="sm" onClick={() => setIsAddingCard(true)} className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Method
                                    </Button>
                                )}
                            </div>

                            {isAddingCard ? (
                                <form onSubmit={handleAddCard} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-gray-700">Add New Card</h4>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingCard(false)}><X className="w-4 h-4" /></Button>
                                    </div>
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Cardholder Name"
                                            value={newCard.name}
                                            onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                                            required
                                        />
                                        <Input
                                            placeholder="Card Number"
                                            value={newCard.number}
                                            onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                                            maxLength={16}
                                            required
                                        />
                                        <div className="flex gap-4">
                                            <Input
                                                placeholder="MM/YY"
                                                className="w-1/2"
                                                value={newCard.expiry}
                                                onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                                                maxLength={5}
                                                required
                                            />
                                            <Input
                                                placeholder="CVC"
                                                className="w-1/2"
                                                value={newCard.cvc}
                                                onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                                                maxLength={3}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button type="button" variant="ghost" onClick={() => setIsAddingCard(false)}>Cancel</Button>
                                        <Button type="submit" className="bg-gray-900 text-white hover:bg-black" disabled={loading}>
                                            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                            Save Card
                                        </Button>
                                    </div>
                                </form>
                            ) : savedCards.length > 0 ? (
                                <div className="space-y-3">
                                    {savedCards.map((card, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-white rounded-lg border border-gray-100">
                                                    <CreditCard className="w-6 h-6 text-gray-900" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">•••• •••• •••• {card.last4}</p>
                                                    <p className="text-xs text-gray-500">Expires {card.expiry}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Primary</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-lg border border-gray-100">
                                            <CreditCard className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-500">No payment method added</p>
                                            <p className="text-xs text-gray-400">Add a card to upgrade your plan</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gray-900 text-white rounded-2xl p-6">
                        <h3 className="font-bold mb-6">Usage Summary</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Storage</span>
                                    <span className="font-medium">1.2 GB / 10 GB</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Bandwidth</span>
                                    <span className="font-medium">450 MB / 50 GB</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '1%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Billing History</h3>
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Invoice</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {/* Placeholder Row */}
                                    <tr>
                                        <td className="px-6 py-4 text-center text-gray-500 italic" colSpan={5}>
                                            No billing history available
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
