'use client'

import React, { useState } from 'react'
import { 
  X, FileText, Image as ImageIcon, Video, Music, Code2, FileSpreadsheet, 
  FileIcon, DownloadIcon, Share2Icon, Trash2Icon, Star, Tag, Clock, 
  ShieldCheck, Bot, ExternalLink, HardDrive, Sparkles, Lock, ChevronRight, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimeGradient } from '@/components/providers/time-gradient-provider'

export function FileInspector({ 
  file, 
  onClose, 
  onDownload, 
  onShare, 
  onDelete, 
  onToggleStar, 
  isStarred, 
  currentTag, 
  onSetTag,
  onOpenChatWithPrompt
}) {
  const { timeTheme } = useTimeGradient()
  const [activeTab, setActiveTab] = useState('details')

  if (!file) return null

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)
  const isPdf = ext === 'pdf'
  const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(ext)

  const tagColors = [
    { name: 'Red', color: '#ef4444', class: 'bg-red-500' },
    { name: 'Amber', color: '#f59e0b', class: 'bg-amber-500' },
    { name: 'Emerald', color: '#10b981', class: 'bg-emerald-500' },
    { name: 'Blue', color: '#3b82f6', class: 'bg-blue-500' },
    { name: 'Purple', color: '#8b5cf6', class: 'bg-purple-500' },
    { name: 'Pink', color: '#ec4899', class: 'bg-pink-500' }
  ]

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const createdDate = file.created_at ? new Date(file.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently'

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col animate-slide-in-right transition-all duration-300">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shrink-0">
            {isImage ? <ImageIcon className="w-5 h-5 text-emerald-500" /> :
             isPdf ? <FileText className="w-5 h-5 text-red-500" /> :
             isVideo ? <Video className="w-5 h-5 text-purple-500" /> :
             <FileIcon className="w-5 h-5 text-blue-500" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{file.name}</h3>
            <p className="text-[11px] text-slate-400 font-mono uppercase">{ext} • {formatFileSize(file.metadata?.size)}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 gap-4 text-xs font-semibold">
        {['details', 'security', 'ai'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 relative capitalize transition-colors ${
              activeTab === tab 
                ? 'text-slate-900 dark:text-white font-bold' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'details' ? 'Properties' : tab === 'security' ? 'Security & Share' : 'AI Assistant'}
            {activeTab === tab && (
              <span 
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                style={{ backgroundColor: timeTheme.accentColor }} 
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Preview Container */}
        <div className={`rounded-2xl p-6 bg-gradient-to-br ${timeTheme.cardGradient} border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
          <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
            {isImage ? <ImageIcon className="w-8 h-8 text-emerald-500" /> :
             isPdf ? <FileText className="w-8 h-8 text-red-500" /> :
             isVideo ? <Video className="w-8 h-8 text-purple-500" /> :
             <FileIcon className="w-8 h-8 text-blue-500" />}
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">{file.name}</span>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">{formatFileSize(file.metadata?.size)}</span>
        </div>

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Color Tag</label>
              <div className="flex items-center gap-2">
                {tagColors.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => onSetTag(file.name, t.color)}
                    className={`w-7 h-7 rounded-full ${t.class} flex items-center justify-center transition-transform hover:scale-110 shadow-xs ${
                      currentTag === t.color ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500' : ''
                    }`}
                    title={`Tag as ${t.name}`}
                  >
                    {currentTag === t.color && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">File Metadata</label>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400">File Type</span>
                  <span className="font-semibold uppercase font-mono">{ext || 'File'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400">Exact Size</span>
                  <span className="font-semibold font-mono">{file.metadata?.size?.toLocaleString() || 0} bytes</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400">Uploaded On</span>
                  <span className="font-semibold">{createdDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400">Vault Bucket</span>
                  <span className="font-semibold font-mono text-emerald-500">files</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security */}
        {activeTab === 'security' && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" /> Row-Level Encrypted Storage
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 leading-relaxed">
                This file is stored in your private bucket folder with Supabase Row-Level Security active.
              </p>
            </div>

            <Button
              onClick={() => onShare(file.name)}
              className={`w-full ${timeTheme.buttonGradient} ${timeTheme.buttonHover} text-white font-bold rounded-xl h-11 shadow-md gap-2`}
            >
              <Share2Icon className="w-4 h-4" /> Configure Share Settings & Passcode
            </Button>
          </div>
        )}

        {/* Tab 3: AI Assistant */}
        {activeTab === 'ai' && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                <Bot className="w-4 h-4 text-indigo-500" /> Nimbus AI Workspace Analysis
              </div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 leading-relaxed">
                Analyze content, summarize insights, or generate questions based on this file.
              </p>
            </div>

            <Button
              onClick={() => onOpenChatWithPrompt(`Summarize and analyze my file: ${file.name}`)}
              className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl h-11 gap-2 hover:scale-[1.02] transition-transform"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Ask AI to Summarize File
            </Button>
          </div>
        )}
      </div>

      {/* Footer Quick Actions */}
      <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 bg-slate-50/50 dark:bg-slate-950/50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(file.name)}
          className="rounded-xl font-semibold gap-1 text-xs"
        >
          <DownloadIcon className="w-3.5 h-3.5" /> Download
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStar(file.name)}
          className={`rounded-xl font-semibold gap-1 text-xs ${isStarred ? 'text-amber-500 border-amber-300' : ''}`}
        >
          <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-500 text-amber-500' : ''}`} /> {isStarred ? 'Starred' : 'Star'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(file.name)}
          className="rounded-xl font-semibold gap-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
        >
          <Trash2Icon className="w-3.5 h-3.5" /> Delete
        </Button>
      </div>
    </div>
  )
}
