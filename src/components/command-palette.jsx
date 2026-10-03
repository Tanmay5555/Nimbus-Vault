'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, FolderIcon, Star, Clock, Trash2Icon, User, Settings, 
  CloudUpload, FolderPlus, Sun, Sunrise, Sunset, Moon, Sparkles, 
  Command, Home, ArrowRight, FileIcon, X
} from 'lucide-react'
import { useTimeGradient } from '@/components/providers/time-gradient-provider'

export function CommandPalette({ 
  isOpen, 
  onClose, 
  files = [], 
  onSelectView, 
  onSelectFile, 
  onUploadClick, 
  onCreateFolderClick 
}) {
  const { setManualMode, timeTheme } = useTimeGradient()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else onClose(false) // Toggle open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))

  const navigationCommands = [
    { label: 'Home Landing Page', icon: Home, action: () => { onSelectView('home'); onClose(); }, category: 'Navigation' },
    { label: 'My Vault Files', icon: FolderIcon, action: () => { onSelectView('files'); onClose(); }, category: 'Navigation' },
    { label: 'Starred Favorites', icon: Star, action: () => { onSelectView('starred'); onClose(); }, category: 'Navigation' },
    { label: 'Recent Uploads', icon: Clock, action: () => { onSelectView('recent'); onClose(); }, category: 'Navigation' },
    { label: 'Trash Vault', icon: Trash2Icon, action: () => { onSelectView('trash'); onClose(); }, category: 'Navigation' },
    { label: 'Billing & Account Settings', icon: Settings, action: () => { onSelectView('billing'); onClose(); }, category: 'Navigation' }
  ].filter(c => c.label.toLowerCase().includes(query.toLowerCase()))

  const themeCommands = [
    { label: 'Time Theme: Morning Dawn', icon: Sunrise, action: () => { setManualMode('morning'); onClose(); } },
    { label: 'Time Theme: Sunlit Day', icon: Sun, action: () => { setManualMode('afternoon'); onClose(); } },
    { label: 'Time Theme: Golden Sunset', icon: Sunset, action: () => { setManualMode('sunset'); onClose(); } },
    { label: 'Time Theme: Midnight Cosmic', icon: Moon, action: () => { setManualMode('night'); onClose(); } },
    { label: 'Time Theme: Auto (Live Clock)', icon: Clock, action: () => { setManualMode('auto'); onClose(); } }
  ].filter(c => c.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-md animate-fade-in-up">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 text-slate-900 dark:text-slate-100 flex flex-col max-h-[80vh]">
        {/* Search Header Input */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search files (Ctrl+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base font-medium focus:outline-none placeholder-slate-400"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Body List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-medium">
          {/* Quick Actions */}
          {query === '' && (
            <div className="flex items-center gap-2 px-3 pt-2">
              <button
                onClick={() => { onUploadClick(); onClose(); }}
                className={`flex-1 py-2.5 px-3 rounded-2xl ${timeTheme.badgeBg} font-bold text-xs flex items-center justify-center gap-2 border hover:scale-102 transition-transform`}
              >
                <CloudUpload className="w-4 h-4" /> Upload Files
              </button>
              <button
                onClick={() => { onCreateFolderClick(); onClose(); }}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <FolderPlus className="w-4 h-4" /> New Folder
              </button>
            </div>
          )}

          {/* Navigation Section */}
          {navigationCommands.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</div>
              {navigationCommands.map((cmd, idx) => {
                const CIcon = cmd.icon
                return (
                  <button
                    key={idx}
                    onClick={cmd.action}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <CIcon className="w-4 h-4 text-slate-400" />
                      <span>{cmd.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Matching Files */}
          {filteredFiles.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Vault Files ({filteredFiles.length})</div>
              {filteredFiles.slice(0, 5).map((f) => (
                <button
                  key={f.name}
                  onClick={() => { onSelectFile(f); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileIcon className="w-4 h-4 text-blue-500" />
                    <span className="truncate max-w-[300px]">{f.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Inspect</span>
                </button>
              ))}
            </div>
          )}

          {/* Theme Commands */}
          {themeCommands.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Atmosphere Themes</div>
              {themeCommands.map((cmd, idx) => {
                const CIcon = cmd.icon
                return (
                  <button
                    key={idx}
                    onClick={cmd.action}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <CIcon className="w-4 h-4" style={{ color: timeTheme.accentColor }} />
                      <span>{cmd.label}</span>
                    </div>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: timeTheme.accentColor }} />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>Use ↑↓ to navigate</span>
            <span>ESC to close</span>
          </div>
          <span>NimbusVault Command Center</span>
        </div>
      </div>
    </div>
  )
}
