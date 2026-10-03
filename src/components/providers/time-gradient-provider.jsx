'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const TimeGradientContext = createContext({
  timePeriod: 'night',
  manualMode: 'auto',
  setManualMode: () => {},
  timeString: '',
  time24String: '',
  dateString: '',
  timeTheme: {},
  timePeriods: []
})

export const TIME_THEMES = {
  morning: {
    period: 'morning',
    label: 'Morning Dawn',
    greeting: 'Good Morning',
    tagline: 'Fresh sunrise light & warm golden hues',
    iconName: 'Sunrise',
    timeRange: '05:00 - 11:59',
    gradientClass: 'from-amber-500/15 via-orange-400/10 to-rose-400/15',
    cardGradient: 'from-amber-500/10 via-rose-500/5 to-amber-500/10',
    textGradient: 'from-amber-500 via-orange-500 to-rose-500',
    buttonGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500',
    buttonHover: 'hover:from-amber-600 hover:via-orange-600 hover:to-rose-600',
    borderGradient: 'border-amber-500/30 dark:border-amber-500/40',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    lightOrb1: 'bg-amber-400/30',
    lightOrb2: 'bg-rose-400/25',
    lightOrb3: 'bg-sky-400/20',
  },
  afternoon: {
    period: 'afternoon',
    label: 'Sunlit Day',
    greeting: 'Good Afternoon',
    tagline: 'Bright midday energy & vivid azure sky',
    iconName: 'Sun',
    timeRange: '12:00 - 16:59',
    gradientClass: 'from-blue-500/15 via-cyan-400/10 to-indigo-500/15',
    cardGradient: 'from-blue-500/10 via-cyan-500/5 to-indigo-500/10',
    textGradient: 'from-blue-500 via-cyan-500 to-indigo-600 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400',
    buttonGradient: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600',
    buttonHover: 'hover:from-blue-700 hover:via-cyan-700 hover:to-indigo-700',
    borderGradient: 'border-blue-500/30 dark:border-blue-500/40',
    accentColor: '#2563eb',
    glowColor: 'rgba(37, 99, 235, 0.3)',
    badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
    lightOrb1: 'bg-blue-400/30',
    lightOrb2: 'bg-cyan-400/25',
    lightOrb3: 'bg-indigo-400/20',
  },
  sunset: {
    period: 'sunset',
    label: 'Golden Sunset',
    greeting: 'Good Evening',
    tagline: 'Vivid sunset pinks & deep violet dusk',
    iconName: 'Sunset',
    timeRange: '17:00 - 20:59',
    gradientClass: 'from-orange-500/15 via-pink-500/10 to-purple-500/15',
    cardGradient: 'from-orange-500/10 via-pink-500/5 to-purple-500/10',
    textGradient: 'from-orange-500 via-pink-500 to-purple-600 dark:from-orange-400 dark:via-pink-400 dark:to-purple-400',
    buttonGradient: 'bg-gradient-to-r from-orange-500 via-pink-600 to-purple-600',
    buttonHover: 'hover:from-orange-600 hover:via-pink-700 hover:to-purple-700',
    borderGradient: 'border-orange-500/30 dark:border-orange-500/40',
    accentColor: '#ea580c',
    glowColor: 'rgba(234, 88, 12, 0.3)',
    badgeBg: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30',
    lightOrb1: 'bg-orange-400/30',
    lightOrb2: 'bg-pink-400/25',
    lightOrb3: 'bg-purple-400/20',
  },
  night: {
    period: 'night',
    label: 'Midnight Cosmic',
    greeting: 'Good Night',
    tagline: 'Deep space indigo & glowing neon violet',
    iconName: 'Moon',
    timeRange: '21:00 - 04:59',
    gradientClass: 'from-indigo-500/20 via-purple-500/15 to-teal-400/15',
    cardGradient: 'from-indigo-500/10 via-purple-500/5 to-cyan-500/10',
    textGradient: 'from-indigo-400 via-purple-400 to-cyan-400',
    buttonGradient: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600',
    buttonHover: 'hover:from-indigo-700 hover:via-purple-700 hover:to-teal-700',
    borderGradient: 'border-indigo-500/30 dark:border-indigo-500/40',
    accentColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    lightOrb1: 'bg-indigo-500/30',
    lightOrb2: 'bg-purple-500/25',
    lightOrb3: 'bg-teal-400/20',
  }
}

export function calculateTimePeriod(hour) {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'sunset'
  return 'night'
}

export function TimeGradientProvider({ children }) {
  const [manualMode, setManualMode] = useState('auto')
  const [now, setNow] = useState(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const currentHour = now ? now.getHours() : 22 // Default to night/evening if SSR
  const autoPeriod = calculateTimePeriod(currentHour)
  const activePeriod = manualMode === 'auto' ? autoPeriod : manualMode
  const timeTheme = TIME_THEMES[activePeriod] || TIME_THEMES.night

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-time-period', activePeriod)
    }
  }, [activePeriod])

  const timeString = now ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '10:12:31 PM'
  const time24String = now ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}` : '22:12:31'
  const dateString = now ? now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : 'Sat, Oct 3'

  const timePeriodsList = [
    { key: 'auto', label: 'Auto (Live Clock)', iconName: 'Clock' },
    { key: 'morning', label: 'Morning (05:00 - 11:59)', iconName: 'Sunrise' },
    { key: 'afternoon', label: 'Afternoon (12:00 - 16:59)', iconName: 'Sun' },
    { key: 'sunset', label: 'Sunset (17:00 - 20:59)', iconName: 'Sunset' },
    { key: 'night', label: 'Night (21:00 - 04:59)', iconName: 'Moon' }
  ]

  return (
    <TimeGradientContext.Provider value={{
      timePeriod: activePeriod,
      manualMode,
      setManualMode,
      timeString,
      time24String,
      dateString,
      timeTheme,
      timePeriods: timePeriodsList,
      isAuto: manualMode === 'auto'
    }}>
      {children}
    </TimeGradientContext.Provider>
  )
}

export function useTimeGradient() {
  return useContext(TimeGradientContext)
}
