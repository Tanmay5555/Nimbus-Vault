'use client'

import React from 'react'
import { 
  X, HardDrive, PieChart, Sparkles, Trash2Icon, FileText, Image as ImageIcon, 
  Video, Music, Code2, AlertTriangle, CheckCircle2, RefreshCw, Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimeGradient } from '@/components/providers/time-gradient-provider'

export function StorageAnalyticsModal({ 
  isOpen, 
  onClose, 
  files = [], 
  onEmptyTrash, 
  onFilterLargeFiles 
}) {
  const { timeTheme } = useTimeGradient()

  if (!isOpen) return null

  const totalSize = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0)
  const totalSizeGB = totalSize / (1024 * 1024 * 1024)
  const limitGB = 10
  const usagePercentage = Math.min((totalSizeGB / limitGB) * 100, 100)

  const docsFiles = files.filter(f => ['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx'].includes(f.name.split('.').pop()?.toLowerCase() || ''))
  const imgsFiles = files.filter(f => ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(f.name.split('.').pop()?.toLowerCase() || ''))
  const vidsFiles = files.filter(f => ['mp4', 'mov', 'avi', 'mkv'].includes(f.name.split('.').pop()?.toLowerCase() || ''))
  const audioFiles = files.filter(f => ['mp3', 'wav', 'flac'].includes(f.name.split('.').pop()?.toLowerCase() || ''))

  const docsSize = docsFiles.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)
  const imgsSize = imgsFiles.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)
  const vidsSize = vidsFiles.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)
  const audioSize = audioFiles.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)
  const otherSize = Math.max(0, totalSize - (docsSize + imgsSize + vidsSize + audioSize))

  const largeFiles = files.filter(f => (f.metadata?.size || 0) > 10 * 1024 * 1024)

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in-up">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 text-slate-900 dark:text-slate-100 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${timeTheme.badgeBg} border`}>
              <HardDrive className="w-5 h-5" style={{ color: timeTheme.accentColor }} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">Vault Storage Analytics</h3>
              <p className="text-xs text-slate-400">Detailed capacity & cleanup metrics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Health Score & Total Bar */}
        <div className={`rounded-2xl p-5 bg-gradient-to-br ${timeTheme.cardGradient} border border-slate-200 dark:border-slate-800 space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-bold text-sm">Storage Health Score</span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              98 / 100 Optimal
            </span>
          </div>

          <div className="flex items-end justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">Used Capacity</span>
            <span className="font-bold font-mono text-sm">{formatFileSize(totalSize)} / 10 GB ({Math.round(usagePercentage)}%)</span>
          </div>

          {/* Multi-colored storage bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex transition-all duration-500">
            <div className="bg-blue-500 h-full" style={{ width: `${(docsSize / (10 * 1024 * 1024 * 1024)) * 100}%` }} title={`Docs: ${formatFileSize(docsSize)}`} />
            <div className="bg-emerald-500 h-full" style={{ width: `${(imgsSize / (10 * 1024 * 1024 * 1024)) * 100}%` }} title={`Images: ${formatFileSize(imgsSize)}`} />
            <div className="bg-purple-500 h-full" style={{ width: `${(vidsSize / (10 * 1024 * 1024 * 1024)) * 100}%` }} title={`Videos: ${formatFileSize(vidsSize)}`} />
            <div className="bg-amber-500 h-full" style={{ width: `${(audioSize / (10 * 1024 * 1024 * 1024)) * 100}%` }} title={`Audio: ${formatFileSize(audioSize)}`} />
            <div className="bg-cyan-500 h-full" style={{ width: `${(otherSize / (10 * 1024 * 1024 * 1024)) * 100}%` }} title={`Other: ${formatFileSize(otherSize)}`} />
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-500">
              <FileText className="w-4 h-4" /> Documents
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-sm">{formatFileSize(docsSize)}</div>
            <div className="text-[10px] text-slate-400">{docsFiles.length} files</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-500">
              <ImageIcon className="w-4 h-4" /> Media Images
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-sm">{formatFileSize(imgsSize)}</div>
            <div className="text-[10px] text-slate-400">{imgsFiles.length} files</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-500">
              <Video className="w-4 h-4" /> Video Files
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-sm">{formatFileSize(vidsSize)}</div>
            <div className="text-[10px] text-slate-400">{vidsFiles.length} files</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-500">
              <Music className="w-4 h-4" /> Audio Track
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-sm">{formatFileSize(audioSize)}</div>
            <div className="text-[10px] text-slate-400">{audioFiles.length} files</div>
          </div>
        </div>

        {/* Storage Clean-up Recommendations */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vault Optimization Actions</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-3">
                <Trash2Icon className="w-4 h-4 text-rose-500" />
                <div>
                  <div className="text-xs font-bold">Empty Trash Vault</div>
                  <div className="text-[10px] text-slate-400">Permanently purge deleted files to free space</div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={onEmptyTrash} className="text-xs rounded-xl font-semibold border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400">
                Purge Trash
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-xs font-bold">Large Files (&gt; 10 MB)</div>
                  <div className="text-[10px] text-slate-400">{largeFiles.length} large files found in your vault</div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={onFilterLargeFiles} className="text-xs rounded-xl font-semibold">
                Filter Large
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Button onClick={onClose} className={`${timeTheme.buttonGradient} text-white font-bold rounded-xl px-6 text-xs`}>
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
