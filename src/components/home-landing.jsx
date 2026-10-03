'use client'

import React, { useState } from 'react'
import { useTimeGradient } from '@/components/providers/time-gradient-provider'
import { TimeGradientBadge } from '@/components/time-gradient-selector'
import { 
  Cloud, Shield, Sparkles, Rocket, ArrowRight, HardDrive, Share2, 
  Lock, Zap, FileText, CheckCircle2, Eye, Sun, Sunrise, Sunset, Moon, 
  FolderPlus, Layers, Search, Bot, Clock, Star, Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useTheme } from 'next-themes'

export function HomeLanding({ onLaunchDashboard, user }) {
  const { timePeriod, manualMode, setManualMode, timeTheme, timePeriods, timeString, dateString } = useTimeGradient()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('all')

  const features = [
    {
      icon: Cloud,
      title: 'Lightning Cloud Storage',
      description: 'Upload, manage, and retrieve your files at high speeds with automatic bucket synchronization.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Sparkles,
      title: 'Time-Adaptive UI Gradients',
      description: 'The app seamlessly adapts its color gradients and aesthetic highlights based on your local clock.',
      color: 'from-amber-500 to-rose-500'
    },
    {
      icon: Bot,
      title: 'Integrated AI Vault Assistant',
      description: 'Ask questions, summarize document contents, and get storage assistance directly from the AI chat widget.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Share2,
      title: 'Protected Share Links',
      description: 'Create shareable links with optional password protection, custom view limits, and expiration timers.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Lock,
      title: 'End-to-End Vault Security',
      description: 'Your data is secured with Supabase Auth and encrypted storage policies ensuring total file privacy.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Layers,
      title: 'Smart Tags & Categories',
      description: 'Organize files with color tags, filter by documents, media, audio, or starred favorites instantly.',
      color: 'from-cyan-500 to-blue-600'
    }
  ]

  const showcasePeriods = [
    {
      key: 'morning',
      title: 'Morning Dawn',
      time: '05:00 - 11:59',
      desc: 'Golden dawn light, warm rose accents & invigorating sunrise colors.',
      icon: Sunrise,
      gradientBg: 'from-amber-500/20 via-orange-500/20 to-rose-500/20',
      badge: 'Sunrise Gold'
    },
    {
      key: 'afternoon',
      title: 'Sunlit Day',
      time: '12:00 - 16:59',
      desc: 'Crisp midday sky, vivid azure highlights & electric blue energy.',
      icon: Sun,
      gradientBg: 'from-blue-500/20 via-cyan-500/20 to-indigo-500/20',
      badge: 'Azure Sky'
    },
    {
      key: 'sunset',
      title: 'Golden Sunset',
      time: '17:00 - 20:59',
      desc: 'Radiant sunset glow, violet twilight sky & orange-pink gradients.',
      icon: Sunset,
      gradientBg: 'from-orange-500/20 via-pink-500/20 to-purple-500/20',
      badge: 'Twilight Magenta'
    },
    {
      key: 'night',
      title: 'Midnight Cosmic',
      time: '21:00 - 04:59',
      desc: 'Deep space indigo, obsidian night theme & vibrant neon violet glow.',
      icon: Moon,
      gradientBg: 'from-indigo-500/20 via-purple-500/20 to-teal-400/20',
      badge: 'Starlight Neon'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-1000 relative overflow-x-hidden">
      {/* Background Dynamic Ambient Light Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 animate-float ${timeTheme.lightOrb1}`}
        />
        <div 
          className={`absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] transition-all duration-1000 animate-float ${timeTheme.lightOrb2}`}
          style={{ animationDelay: '2s' }}
        />
        <div 
          className={`absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000 ${timeTheme.lightOrb3}`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${timeTheme.buttonGradient} flex items-center justify-center text-white shadow-lg shadow-amber-500/20 transition-all duration-1000`}>
              <Cloud className="w-5 h-5" />
            </div>
            <span className={`text-xl font-extrabold bg-gradient-to-r ${timeTheme.textGradient} bg-clip-text text-transparent tracking-tight transition-all duration-1000`}>
              NimbusVault
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#atmosphere" className="hover:text-slate-900 dark:hover:text-white transition-colors">Time Atmosphere</a>
            <a href="#security" className="hover:text-slate-900 dark:hover:text-white transition-colors">Security</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <TimeGradientBadge />

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {user ? (
              <Button
                onClick={onLaunchDashboard}
                className={`${timeTheme.buttonGradient} ${timeTheme.buttonHover} text-white font-bold rounded-xl shadow-lg transition-all duration-500 gap-2`}
              >
                Launch Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="font-semibold text-xs sm:text-sm rounded-xl">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className={`${timeTheme.buttonGradient} ${timeTheme.buttonHover} text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all duration-500`}>
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Dynamic Time Greeting Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl mb-6 shadow-sm animate-fade-in-up transition-all duration-1000 text-xs sm:text-sm font-semibold"
          style={{
            borderColor: `${timeTheme.accentColor}40`,
            backgroundColor: `${timeTheme.accentColor}10`
          }}
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" style={{ color: timeTheme.accentColor }} />
          <span>{timeTheme.greeting}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="font-bold" style={{ color: timeTheme.accentColor }}>{timeTheme.label} Atmosphere</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          Next-Gen Cloud Storage with{' '}
          <span className={`bg-gradient-to-r ${timeTheme.textGradient} bg-clip-text text-transparent transition-all duration-1000`}>
            Time-Adaptive Gradients
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          Store, organize, and share your cloud files in an intelligent vault that dynamically evolves its gradient atmosphere based on the time of day.
        </p>

        {/* Dual Call-To-Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            onClick={onLaunchDashboard}
            size="lg"
            className={`${timeTheme.buttonGradient} ${timeTheme.buttonHover} text-white font-bold rounded-2xl h-14 px-8 text-base shadow-xl hover:scale-105 transition-all duration-300 gap-3 group`}
          >
            <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Open Vault Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <a href="#atmosphere">
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl h-14 px-8 text-base font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 backdrop-blur-md transition-all gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Explore Time Themes</span>
            </Button>
          </a>
        </div>

        {/* Interactive App Preview Showcase Card */}
        <div className="relative max-w-5xl mx-auto rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-white/80 to-white/40 dark:from-slate-900/80 dark:to-slate-900/40 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl transition-all duration-1000 group">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-4 sm:p-6 text-left">
            {/* Top Mac-style window controls */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">nimbus-vault://drive/my-files</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-400" /> {timeString} ({timeTheme.label})
                </span>
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Sidebar Mockup */}
              <div className="space-y-2 hidden md:block border-r border-slate-800 pr-4">
                <div className={`p-2.5 rounded-xl ${timeTheme.badgeBg} font-semibold text-xs flex items-center gap-2`}>
                  <HardDrive className="w-4 h-4" /> My Vault Files
                </div>
                <div className="p-2.5 rounded-xl hover:bg-slate-900 text-slate-400 text-xs flex items-center gap-2">
                  <Star className="w-4 h-4" /> Starred Files
                </div>
                <div className="p-2.5 rounded-xl hover:bg-slate-900 text-slate-400 text-xs flex items-center gap-2">
                  <Bot className="w-4 h-4" /> AI Vault Assistant
                </div>
                <div className="mt-8 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Vault Storage</span>
                    <span className="font-bold text-slate-200">2.4 GB / 10 GB</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${timeTheme.buttonGradient} transition-all duration-1000`} style={{ width: '24%' }} />
                  </div>
                </div>
              </div>

              {/* Main Content Area Mockup */}
              <div className="md:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      Recent Vault Documents
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono">ENCRYPTED</span>
                    </h3>
                    <p className="text-xs text-slate-400">Time-synced real-time dashboard view</p>
                  </div>
                  <Button size="sm" onClick={onLaunchDashboard} className={`${timeTheme.buttonGradient} text-xs font-bold rounded-lg`}>
                    + Upload File
                  </Button>
                </div>

                {/* Sample Mockup Items */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Q4_Financial_Report.pdf', size: '4.2 MB', icon: FileText, color: 'text-rose-400', tag: 'Document' },
                    { name: 'Product_Design_v2.png', size: '12.8 MB', icon: Layers, color: 'text-sky-400', tag: 'Design' },
                    { name: 'Vault_AI_Summary.txt', size: '1.1 MB', icon: Sparkles, color: 'text-amber-400', tag: 'AI Insight' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{item.tag}</span>
                      </div>
                      <div className="font-semibold text-xs truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.size}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time Atmosphere Showcase Section */}
      <section id="atmosphere" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider mb-4">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Dynamic Time Palette Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Aesthetic UI that Adapts to Your{' '}
            <span className={`bg-gradient-to-r ${timeTheme.textGradient} bg-clip-text text-transparent transition-all duration-1000`}>
              Local Time of Day
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Click any period below to preview how NimbusVault smooth-transitions its gradient background, card borders, light glow orbs, and text highlights!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcasePeriods.map((p) => {
            const PIcon = p.icon
            const isActive = timePeriod === p.key
            return (
              <div
                key={p.key}
                onClick={() => setManualMode(p.key)}
                className={`cursor-pointer rounded-3xl p-6 border transition-all duration-500 relative overflow-hidden group ${
                  isActive
                    ? 'border-2 shadow-2xl scale-105 bg-white dark:bg-slate-900'
                    : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:scale-102 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                style={{
                  borderColor: isActive ? timeTheme.accentColor : undefined
                }}
              >
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${p.gradientBg} blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center`}>
                    <PIcon className="w-6 h-6" style={{ color: isActive ? timeTheme.accentColor : undefined }} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {p.time}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1 relative z-10">{p.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 relative z-10">{p.desc}</p>

                <div className="flex items-center justify-between text-xs font-semibold relative z-10 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-mono text-[11px]">{p.badge}</span>
                  <span className="flex items-center gap-1" style={{ color: timeTheme.accentColor }}>
                    {isActive ? 'Active Theme' : 'Click to Apply'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Vault Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Built for Modern Workflows & Instant Access
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Everything you need for secure storage, intelligent file organization, and real-time collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div 
              key={idx}
              className="p-8 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <feat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & AI Assistant Showcase */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Military-Grade Security & Privacy
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Your Files Stay Completely Protected & Encrypted
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              NimbusVault uses Supabase row-level security policies, isolated user storage buckets, and granular share settings with passcodes and link expiration.
            </p>
            <div className="space-y-3 pt-2">
              {[
                'Row-Level Security (RLS) on all storage buckets',
                'Password-protected shareable file download links',
                'Custom expiration dates on shared files',
                'Permanent or reversible soft deletion with Trash vault'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Nimbus AI Assistant</h3>
                <p className="text-xs text-indigo-300">Always active in your workspace</p>
              </div>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
                &quot;How do I share my file securely with an expiration date?&quot;
              </div>
              <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-200">
                ✨ Click the Share icon on any file, toggle &quot;Password Protection&quot;, set an expiration date, and copy your secure share URL!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Simple, Transparent Storage Plans
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Start with 10 GB free cloud vault storage and upgrade whenever you need more space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Free Starter</div>
              <div className="text-4xl font-extrabold mb-4">$0 <span className="text-base font-normal text-slate-400">/ forever</span></div>
              <p className="text-xs text-slate-500 mb-6">Perfect for personal file backups and document organization.</p>
              <ul className="space-y-3 text-xs font-medium mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 10 GB Encrypted Storage</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Vault Assistant Access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Time-Adaptive Gradients</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Basic Link Sharing</li>
              </ul>
            </div>
            <Button onClick={onLaunchDashboard} className="w-full rounded-xl font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
              Get Started Free
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
              MOST POPULAR
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">Vault Pro</div>
              <div className="text-4xl font-extrabold mb-4">$9.99 <span className="text-base font-normal text-slate-400">/ month</span></div>
              <p className="text-xs text-slate-500 mb-6">For power users requiring high storage capacity and priority speed.</p>
              <ul className="space-y-3 text-xs font-medium mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 500 GB Storage Bucket</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Password & Expiring Links</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited AI Summaries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priority Upload Speed</li>
              </ul>
            </div>
            <Button onClick={onLaunchDashboard} className={`${timeTheme.buttonGradient} text-white font-bold w-full rounded-xl shadow-lg`}>
              Start Pro Vault
            </Button>
          </div>

          {/* Enterprise Tier */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-2">Team Enterprise</div>
              <div className="text-4xl font-extrabold mb-4">$29.99 <span className="text-base font-normal text-slate-400">/ month</span></div>
              <p className="text-xs text-slate-500 mb-6">For teams requiring custom domains, audit logs, and shared vaults.</p>
              <ul className="space-y-3 text-xs font-medium mb-8">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2 TB Shared Vault Storage</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-User Team Permissions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Custom Subdomain & Branding</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24/7 Priority Support</li>
              </ul>
            </div>
            <Button onClick={onLaunchDashboard} variant="outline" className="w-full rounded-xl font-bold border-slate-300 dark:border-slate-700">
              Contact Enterprise
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`rounded-3xl p-10 md:p-16 text-center text-white ${timeTheme.buttonGradient} shadow-2xl relative overflow-hidden transition-all duration-1000`}>
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to Experience the Time-Adaptive Cloud Vault?
            </h2>
            <p className="text-white/90 text-base sm:text-lg">
              Organize your files with real-time AI assistance, custom color tagging, and adaptive time gradients.
            </p>
            <Button
              onClick={onLaunchDashboard}
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold rounded-2xl h-14 px-8 text-base shadow-2xl transition-all duration-300 gap-2 hover:scale-105"
            >
              <span>Launch NimbusVault Free</span>
              <ArrowRight className="w-5 h-5 text-slate-900" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">NimbusVault</span>
            <span>© 2026 Nimbus Cloud Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5" style={{ color: timeTheme.accentColor }} />
              <span>Current Time: {timeString}</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Theme: {timeTheme.label}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
