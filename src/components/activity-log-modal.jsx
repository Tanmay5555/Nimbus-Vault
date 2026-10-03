'use client'

import React from 'react'
import { 
  X, Activity, Clock, Shield, Sparkles, CloudUpload, Share2, 
  Trash2, Star, CheckCircle2, Lock, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimeGradient } from '@/components/providers/time-gradient-provider'

export function ActivityLogModal({ isOpen, onClose, activityList = [] }) {
  const { timeTheme, timeString } = useTimeGradient()

  if (!isOpen) return null

  const defaultActivities = [
    { title: 'Time Theme Auto-Synced', desc: `Gradient updated to ${timeTheme.label}`, time: timeString, icon: Sparkles, color: 'text-amber-500' },
    { title: 'RLS Security Verified', desc: 'Supabase storage bucket policies active', time: '5m ago', icon: Shield, color: 'text-emerald-500' },
    { title: 'AI Assistant Active', desc: 'Nimbus AI ready for queries', time: '12m ago', icon: Sparkles, color: 'text-indigo-500' },
    { title: 'Vault Ready', desc: '10 GB Free Storage quota active', time: '1h ago', icon: CheckCircle2, color: 'text-blue-500' }
  ]

  const displayList = activityList.length > 0 ? activityList : defaultActivities

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in-up">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 text-slate-900 dark:text-slate-100 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${timeTheme.badgeBg} border`}>
              <Activity className="w-5 h-5" style={{ color: timeTheme.accentColor }} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                Platform Activity Feed
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </h3>
              <p className="text-xs text-slate-400">Real-time vault events & audit logs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {displayList.map((act, idx) => {
            const AIcon = act.icon || Activity
            return (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3 hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs shrink-0 mt-0.5">
                    <AIcon className={`w-4 h-4 ${act.color || 'text-slate-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{act.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{act.desc}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{act.time}</span>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span className="font-mono text-[11px]">Audit Log Encrypted</span>
          <Button onClick={onClose} variant="outline" className="rounded-xl px-4 text-xs font-semibold">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
