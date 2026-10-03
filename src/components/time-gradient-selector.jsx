'use client'

import React, { useState } from 'react'
import { useTimeGradient } from '@/components/providers/time-gradient-provider'
import { Sun, Sunrise, Sunset, Moon, Clock, Sparkles, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ICON_MAP = {
  Sunrise: Sunrise,
  Sun: Sun,
  Sunset: Sunset,
  Moon: Moon,
  Clock: Clock
}

export function TimeGradientBadge({ compact = false }) {
  const { timePeriod, manualMode, setManualMode, timeString, timeTheme, timePeriods, isAuto } = useTimeGradient()
  const [isOpen, setIsOpen] = useState(false)

  const IconComponent = ICON_MAP[timeTheme.iconName] || Clock

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-all duration-500 shadow-sm hover:shadow-md ${timeTheme.badgeBg} hover:scale-105`}
        title="Click to change time theme or switch mode"
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: timeTheme.accentColor }} />
          <span className={`relative inline-flex rounded-full h-2 w-2`} style={{ backgroundColor: timeTheme.accentColor }} />
        </span>
        
        <IconComponent className="w-3.5 h-3.5 animate-pulse" style={{ color: timeTheme.accentColor }} />
        
        <span className="font-mono text-[11px] font-bold tracking-tight">
          {timeString}
        </span>

        {!compact && (
          <span className="hidden sm:inline-block border-l border-current/20 pl-2">
            {timeTheme.label}
          </span>
        )}

        {isAuto && (
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-white/20 dark:bg-black/20 tracking-wider">
            LIVE
          </span>
        )}

        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Switcher Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-fade-in-up text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold">Time-Based UI Theme</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">1s Transition</span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 px-1">
              {timeTheme.tagline}
            </p>

            <div className="space-y-1">
              {timePeriods.map((p) => {
                const PIcon = ICON_MAP[p.iconName] || Clock
                const isSelected = manualMode === p.key
                return (
                  <button
                    key={p.key}
                    onClick={() => {
                      setManualMode(p.key)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <PIcon className="w-3.5 h-3.5" style={{ color: isSelected ? timeTheme.accentColor : undefined }} />
                      <span>{p.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5" style={{ color: timeTheme.accentColor }} />}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
