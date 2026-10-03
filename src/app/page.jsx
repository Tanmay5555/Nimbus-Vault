'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
    FileIcon, Trash2Icon, DownloadIcon, CloudUpload, Share2Icon, FolderIcon, ChevronRight, 
    FolderPlus, Cloud, Star, Clock, User, Settings, HardDrive, Search, Bell, ChevronDown, 
    CreditCard, Award, LogOut, Menu, X, RotateCcw, Eye, FileText, Image as ImageIcon, Video, Music,
    Tag, CheckSquare, Square, Code2, Archive, FileSpreadsheet, BarChart3, Home, Activity, BarChart2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import { useToast } from '@/components/ui/toast'
import { useTheme } from 'next-themes'
import { Sun, Moon, LayoutGrid, List as ListIcon } from 'lucide-react'
import { ShareDialog } from '@/components/share-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { HomeLanding } from '@/components/home-landing'
import { useTimeGradient } from '@/components/providers/time-gradient-provider'
import { TimeGradientBadge } from '@/components/time-gradient-selector'
import { FileInspector } from '@/components/file-inspector'
import { CommandPalette } from '@/components/command-palette'
import { StorageAnalyticsModal } from '@/components/storage-analytics'
import { ActivityLogModal } from '@/components/activity-log-modal'

export default function Dashboard() {
    const [supabase] = useState(() => createClient())
    const router = useRouter()
    const [files, setFiles] = useState([])
    const [folders, setFolders] = useState([])
    const [uploading, setUploading] = useState(false)
    const [user, setUser] = useState(null)
    const [currentPath, setCurrentPath] = useState([])
    const [newFolderName, setNewFolderName] = useState('')
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const fileInputRef = useRef(null)
    const searchInputRef = useRef(null)
    const [viewMode, setViewMode] = useState('grid')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedFileForPreview, setSelectedFileForPreview] = useState(null)
    const [selectedFiles, setSelectedFiles] = useState([])
    const [selectedTagFilter, setSelectedTagFilter] = useState('all')
    const [showDashboardStats, setShowDashboardStats] = useState(true)
    const [activeTagMenuFile, setActiveTagMenuFile] = useState(null)
    const [fileTags, setFileTags] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('fileTags')
            return saved ? JSON.parse(saved) : {}
        }
        return {}
    })

    const [inspectedFile, setInspectedFile] = useState(null)
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
    const [analyticsOpen, setAnalyticsOpen] = useState(false)
    const [activityLogOpen, setActivityLogOpen] = useState(false)
    
    const { addToast } = useToast()
    const { theme, setTheme } = useTheme()
    const { timeTheme } = useTimeGradient()

    // Storage Usage
    const totalSize = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0)
    const totalSizeGB = totalSize / (1024 * 1024 * 1024)
    const limitGB = 10
    const usagePercentage = Math.min((totalSizeGB / limitGB) * 100, 100)

    // Category sizes and counts
    const docsFiles = files.filter(f => ['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx'].includes(f.name.split('.').pop()?.toLowerCase() || ''))
    const imgsFiles = files.filter(f => ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(f.name.split('.').pop()?.toLowerCase() || ''))
    const vidsFiles = files.filter(f => ['mp4', 'mov', 'avi', 'mkv'].includes(f.name.split('.').pop()?.toLowerCase() || ''))
    const audioFiles = files.filter(f => ['mp3', 'wav', 'flac'].includes(f.name.split('.').pop()?.toLowerCase() || ''))

    const docsSize = docsFiles.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)
    const imgsSize = imgsFiles.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)
    const vidsSize = vidsFiles.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)
    const audioSize = audioFiles.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)

    const [view, setView] = useState('home')
    const [starred, setStarred] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('starredFiles')
            return saved ? JSON.parse(saved) : []
        }
        return []
    })

    const handleSetTag = (fileName, tagColor) => {
        const updated = { ...fileTags, [fileName]: fileTags[fileName] === tagColor ? null : tagColor }
        setFileTags(updated)
        localStorage.setItem('fileTags', JSON.stringify(updated))
        addToast(updated[fileName] ? `Tagged ${fileName} as ${tagColor}` : `Removed tag from ${fileName}`, 'info')
    }

    // Keyboard shortcut to search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                searchInputRef.current?.focus()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const toggleStar = (fileName) => {
        const newStarred = starred.includes(fileName)
            ? starred.filter(name => name !== fileName)
            : [...starred, fileName]
        setStarred(newStarred)
        localStorage.setItem('starredFiles', JSON.stringify(newStarred))
        addToast(starred.includes(fileName) ? `Unstarred ${fileName}` : `Starred ${fileName}`, 'info')
    }

    const fetchFiles = useCallback(async (userId, path) => {
        let pathString = path.length > 0 ? `${userId}/${path.join('/')}/` : `${userId}/`

        if (view === 'trash') {
            pathString = `${userId}/.trash/`
        }

        const { data, error } = await supabase
            .storage
            .from('files')
            .list(pathString, {
                limit: 100,
                offset: 0,
                sortBy: {
                    column: view === 'recent' ? 'created_at' : 'name',
                    order: view === 'recent' ? 'desc' : 'asc'
                },
            })

        if (error) {
            console.error(error)
            return
        }

        if (data) {
            let foldersList = data.filter(item => !item.metadata)
            let filesList = data.filter(item => item.metadata && item.name !== '.emptyFolderPlaceholder')

            if (view === 'starred') {
                filesList = filesList.filter(f => starred.includes(f.name))
                foldersList = foldersList.filter(f => starred.includes(f.name))
            }

            setFolders(foldersList)
            setFiles(filesList)
        }
    }, [supabase, view, starred])

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                fetchFiles(user.id, currentPath)
            }
        }
        getUser()
    }, [supabase, currentPath, fetchFiles])

    const handleDelete = async (fileName) => {
        if (view === 'trash') {
            const { error } = await supabase.storage
                .from('files')
                .remove([`${user.id}/.trash/${fileName}`])
            if (!error) {
                addToast(`Permanently deleted ${fileName}`, 'info')
                fetchFiles(user.id, [])
            }
        } else {
            const pathString = currentPath.length > 0 ? `${currentPath.join('/')}/` : ''
            const { error } = await supabase.storage
                .from('files')
                .move(`${user.id}/${pathString}${fileName}`, `${user.id}/.trash/${fileName}`)

            if (!error) {
                addToast(`Moved ${fileName} to Trash`, 'info')
                fetchFiles(user.id, currentPath)
            } else {
                console.error("Error moving to trash:", error)
            }
        }
    }

    const handleRestore = async (fileName) => {
        const { error } = await supabase.storage
            .from('files')
            .move(`${user.id}/.trash/${fileName}`, `${user.id}/${fileName}`)

        if (!error) {
            addToast(`Restored ${fileName}`, 'success')
            fetchFiles(user.id, [])
        } else {
            addToast(`Failed to restore ${fileName}`, 'error')
        }
    }

    const [isDragging, setIsDragging] = useState(false)

    const processUpload = async (file, relativePath = '') => {
        setUploading(true)
        const pathString = currentPath.length > 0 ? `${currentPath.join('/')}/` : ''
        const filePath = `${user.id}/${pathString}${relativePath}${file.name}`

        const { error: uploadError } = await supabase.storage
            .from('files')
            .upload(filePath, file)

        if (uploadError) {
            console.log("Upload error:", uploadError)
            addToast(`Error uploading ${file.name}`, 'error')
        } else {
            addToast(`Uploaded ${file.name}`, 'success')
        }
        setUploading(false)
    }

    const handleUpload = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return
        setUploading(true)
        for (const file of e.target.files) {
            await processUpload(file)
        }
        setUploading(false)
        fetchFiles(user.id, currentPath)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const scanEntries = async (entry) => {
        if (entry.isFile) {
            return new Promise((resolve) => {
                entry.file((file) => {
                    resolve([{ file, path: '' }])
                })
            })
        } else if (entry.isDirectory) {
            const dirReader = entry.createReader()
            const entries = await new Promise((resolve, reject) => {
                dirReader.readEntries(resolve, reject)
            })

            const results = []
            for (const childEntry of entries) {
                const childFiles = await scanEntries(childEntry)
                const processed = childFiles.map(item => ({
                    file: item.file,
                    path: entry.name + '/' + item.path
                }))
                results.push(...processed)
            }
            return results
        }
        return []
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.currentTarget.contains(e.relatedTarget)) return
        setIsDragging(false)
    }

    const handleDrop = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const items = e.dataTransfer.items
        if (!items) return

        setUploading(true)
        const queue = []

        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry()
                if (entry) {
                    const scanned = await scanEntries(entry)
                    queue.push(...scanned)
                }
            }
        }

        addToast(`Uploading ${queue.length} files...`, 'info')

        for (const item of queue) {
            await processUpload(item.file, item.path)
        }

        setUploading(false)
        fetchFiles(user.id, currentPath)
        addToast('All files uploaded successfully!', 'success')
    }

    const handleCreateFolder = async (e) => {
        e.preventDefault()
        if (!newFolderName.trim()) return

        const pathString = currentPath.length > 0 ? `${currentPath.join('/')}/` : ''
        const filePath = `${user.id}/${pathString}${newFolderName}/.emptyFolderPlaceholder`
        const dummyFile = new File([""], ".emptyFolderPlaceholder")

        const { error } = await supabase.storage
            .from('files')
            .upload(filePath, dummyFile)

        if (error) {
            console.error(error)
            addToast('Error creating folder', 'error')
        } else {
            addToast('Folder created successfully!', 'success')
            setNewFolderName('')
            setIsCreatingFolder(false)
            fetchFiles(user.id, currentPath)
        }
    }

    const handleDownload = async (fileName) => {
        const pathString = currentPath.length > 0 ? `${currentPath.join('/')}/` : ''
        const { data, error } = await supabase.storage
            .from('files')
            .download(`${user.id}/${pathString}${fileName}`)

        if (error) {
            console.error(error)
            addToast('Download error', 'error')
            return
        }

        const url = URL.createObjectURL(data)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
        addToast(`Downloading ${fileName}`, 'info')
    }

    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [fileToShare, setFileToShare] = useState(null)

    const handleShare = (fileName) => {
        const pathString = currentPath.length > 0 ? `${currentPath.join('/')}/` : ''
        setFileToShare(`${pathString}${fileName}`)
        setShareDialogOpen(true)
    }

    const navigateToFolder = (folderName) => {
        setView('files')
        setCurrentPath([...currentPath, folderName])
    }

    const navigateUp = (index) => {
        setView('files')
        if (index === -1) {
            setCurrentPath([])
        } else {
            setCurrentPath(currentPath.slice(0, index + 1))
        }
    }

    const toggleSelectFile = (fileName) => {
        setSelectedFiles(prev => 
            prev.includes(fileName) ? prev.filter(name => name !== fileName) : [...prev, fileName]
        )
    }

    const toggleSelectAll = (fileList) => {
        if (selectedFiles.length === fileList.length && fileList.length > 0) {
            setSelectedFiles([])
        } else {
            setSelectedFiles(fileList.map(f => f.name))
        }
    }

    const handleBatchDownload = async () => {
        if (selectedFiles.length === 0) return
        addToast(`Downloading ${selectedFiles.length} files...`, 'info')
        for (const fileName of selectedFiles) {
            await handleDownload(fileName)
        }
        setSelectedFiles([])
    }

    const handleBatchStar = () => {
        if (selectedFiles.length === 0) return
        const newStarred = Array.from(new Set([...starred, ...selectedFiles]))
        setStarred(newStarred)
        localStorage.setItem('starredFiles', JSON.stringify(newStarred))
        addToast(`Starred ${selectedFiles.length} files`, 'success')
        setSelectedFiles([])
    }

    const handleBatchDelete = async () => {
        if (selectedFiles.length === 0) return
        addToast(`Deleting ${selectedFiles.length} files...`, 'info')
        for (const fileName of selectedFiles) {
            await handleDelete(fileName)
        }
        setSelectedFiles([])
    }

    const getFileIconAndColor = (fileName) => {
        const ext = fileName.split('.').pop()?.toLowerCase() || ''
        
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
            return {
                icon: <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs"><ImageIcon className="w-6 h-6" /></div>,
                badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
                glowColor: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
                extLabel: ext.toUpperCase() || 'IMG'
            }
        }
        if (['pdf'].includes(ext)) {
            return {
                icon: <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-xs"><FileText className="w-6 h-6" /></div>,
                badge: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800',
                glowColor: 'hover:border-red-500/50 hover:shadow-red-500/10',
                extLabel: 'PDF'
            }
        }
        if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
            return {
                icon: <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-xs"><FileText className="w-6 h-6" /></div>,
                badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
                glowColor: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
                extLabel: ext.toUpperCase()
            }
        }
        if (['xlsx', 'csv', 'xls'].includes(ext)) {
            return {
                icon: <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-200 dark:border-teal-900/50 shadow-xs"><FileSpreadsheet className="w-6 h-6" /></div>,
                badge: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800',
                glowColor: 'hover:border-teal-500/50 hover:shadow-teal-500/10',
                extLabel: ext.toUpperCase()
            }
        }
        if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
            return {
                icon: <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200 dark:border-purple-900/50 shadow-xs"><Video className="w-6 h-6" /></div>,
                badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
                glowColor: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
                extLabel: 'VIDEO'
            }
        }
        if (['mp3', 'wav', 'flac', 'ogg'].includes(ext)) {
            return {
                icon: <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs"><Music className="w-6 h-6" /></div>,
                badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                glowColor: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
                extLabel: 'AUDIO'
            }
        }
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
            return {
                icon: <div className="p-3 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-900/50 shadow-xs"><Archive className="w-6 h-6" /></div>,
                badge: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-300 dark:border-fuchsia-800',
                glowColor: 'hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/10',
                extLabel: 'ZIP'
            }
        }
        if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json'].includes(ext)) {
            return {
                icon: <div className="p-3 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-200 dark:border-cyan-900/50 shadow-xs"><Code2 className="w-6 h-6" /></div>,
                badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
                glowColor: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
                extLabel: 'CODE'
            }
        }
        return {
            icon: <div className="p-3 bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"><FileIcon className="w-6 h-6" /></div>,
            badge: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800',
            glowColor: 'hover:border-slate-400/50',
            extLabel: ext.toUpperCase() || 'FILE'
        }
    }

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 KB'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    // Filter files
    let filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (selectedCategory !== 'all') {
        filteredFiles = filteredFiles.filter(file => {
            const ext = file.name.split('.').pop()?.toLowerCase() || ''
            if (selectedCategory === 'documents') return ['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx'].includes(ext)
            if (selectedCategory === 'images') return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)
            if (selectedCategory === 'videos') return ['mp4', 'mov', 'avi', 'mkv'].includes(ext)
            if (selectedCategory === 'audio') return ['mp3', 'wav', 'flac'].includes(ext)
            return true
        })
    }
    if (selectedTagFilter !== 'all') {
        filteredFiles = filteredFiles.filter(file => fileTags[file.name] === selectedTagFilter)
    }

    const filteredFolders = folders.filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()))

    if (view === 'home' || !user) {
        return (
            <HomeLanding
                user={user}
                onLaunchDashboard={() => {
                    if (user) {
                        setView('files')
                    } else {
                        router.push('/login')
                    }
                }}
            />
        )
    }

    return (
        <div
            className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden relative transition-colors duration-300"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag and Drop Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-[70] bg-orange-500/10 dark:bg-orange-500/20 backdrop-blur-md flex items-center justify-center p-8">
                    <div className="border-4 border-dashed border-orange-500 rounded-3xl p-12 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 bg-orange-100 dark:bg-orange-950/60 rounded-full mb-6 text-orange-600 dark:text-orange-400">
                            <CloudUpload className="w-16 h-16 animate-bounce" />
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Drop files to Upload</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">They will be saved to {currentPath.length > 0 ? currentPath[currentPath.length - 1] : 'Home'}</p>
                    </div>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 flex-shrink-0 z-50 transition-transform duration-300",
                isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-2 rounded-xl text-white shadow-md">
                            <Cloud className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">NimbusVault</span>
                    </div>
                    <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={() => setIsMobileSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 mb-6">
                    <Button
                        className={cn("w-full text-white shadow-lg hover:shadow-xl transition-all h-12 text-sm font-bold rounded-xl gap-2", timeTheme.buttonGradient, timeTheme.buttonHover)}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        <CloudUpload className="w-5 h-5" />
                        {uploading ? 'Uploading...' : 'Upload Files'}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-3 font-semibold rounded-xl h-11", view === 'home' ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800")}
                        onClick={() => { setView('home'); setIsMobileSidebarOpen(false); }}
                    >
                        <Home className="w-5 h-5" style={{ color: timeTheme.accentColor }} />
                        Home Landing
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-3 font-semibold rounded-xl h-11", view === 'files' ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800")}
                        onClick={() => { setView('files'); setCurrentPath([]); setIsMobileSidebarOpen(false); }}
                    >
                        <FolderIcon className="w-5 h-5 text-orange-500" />
                        My Files
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-3 font-semibold rounded-xl h-11", view === 'shared' ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800")}
                        onClick={() => { setView('shared'); setCurrentPath([]); setIsMobileSidebarOpen(false); }}
                    >
                        <User className="w-5 h-5 text-blue-500" />
                        Shared with Me
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-3 font-semibold rounded-xl h-11", view === 'starred' ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800")}
                        onClick={() => { setView('starred'); setCurrentPath([]); setIsMobileSidebarOpen(false); }}
                    >
                        <Star className="w-5 h-5 text-amber-500" />
                        Starred
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-3 font-semibold rounded-xl h-11", view === 'recent' ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800")}
                        onClick={() => { setView('recent'); setCurrentPath([]); setIsMobileSidebarOpen(false); }}
                    >
                        <Clock className="w-5 h-5 text-purple-500" />
                        Recent
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-3 font-semibold rounded-xl h-11", view === 'trash' ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800")}
                        onClick={() => { setView('trash'); setCurrentPath([]); setIsMobileSidebarOpen(false); }}
                    >
                        <Trash2Icon className="w-5 h-5 text-rose-500" />
                        Trash
                    </Button>
                </nav>

                {/* Storage Widget */}
                <div 
                    onClick={() => setAnalyticsOpen(true)}
                    className="p-6 border-t border-slate-200 dark:border-slate-800 mt-auto bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                    <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
                        <HardDrive className="w-4 h-4 text-orange-500" />
                        <span>Storage Analytics</span>
                        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {formatFileSize(totalSize)} / 10 GB ({Math.round(usagePercentage)}%)
                        </span>
                    </div>

                    {/* Multi-colored Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 mb-3 overflow-hidden flex transition-all duration-500">
                        <div className="bg-blue-500 h-2.5 transition-all duration-500" style={{ width: `${(docsSize / (10 * 1024 * 1024 * 1024)) * 100}%` }} title={`Docs: ${formatFileSize(docsSize)}`} />
                        <div className="bg-emerald-500 h-2.5 transition-all duration-500" style={{ width: `${(imgsSize / (10 * 1024 * 1024 * 1024)) * 100}%` }} title={`Images: ${formatFileSize(imgsSize)}`} />
                        <div className="bg-purple-500 h-2.5 transition-all duration-500" style={{ width: `${(vidsSize / (10 * 1024 * 1024 * 1024)) * 100}%` }} title={`Videos: ${formatFileSize(vidsSize)}`} />
                        <div className="bg-amber-500 h-2.5 transition-all duration-500" style={{ width: `${(audioSize / (10 * 1024 * 1024 * 1024)) * 100}%` }} title={`Audio: ${formatFileSize(audioSize)}`} />
                    </div>

                    {/* Visual Color Legend */}
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Docs: {formatFileSize(docsSize)}</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Imgs: {formatFileSize(imgsSize)}</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Vids: {formatFileSize(vidsSize)}</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Audio: {formatFileSize(audioSize)}</div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2.5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                        onClick={() => router.push('/billing')}
                    >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Billing & Preferences
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 bg-white dark:bg-slate-900 flex-shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setIsMobileSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Search Input Trigger */}
                        <div 
                            className="relative w-48 sm:w-80 md:w-96 cursor-pointer"
                            onClick={() => setCommandPaletteOpen(true)}
                        >
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                ref={searchInputRef}
                                readOnly
                                placeholder="Search files (Ctrl+K)..."
                                className="bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all pl-10 pr-8 rounded-xl text-xs sm:text-sm cursor-pointer"
                                value={searchQuery}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Top Right User Actions */}
                    <div className="flex items-center gap-3">
                        <TimeGradientBadge />

                        {/* View Switcher */}
                        <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-900 shadow-sm text-orange-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-1.5 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-900 shadow-sm text-orange-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}
                                title="List View"
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Theme Toggle Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                        </Button>

                        {/* Activity Log Feed Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl text-slate-600 dark:text-slate-300 relative hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setActivityLogOpen(true)}
                            title="Platform Activity Log Feed"
                        >
                            <Activity className="w-5 h-5 text-indigo-500" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        </Button>

                        <Button variant="ghost" size="icon" className="rounded-xl text-slate-600 dark:text-slate-300 relative hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></span>
                        </Button>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800 focus:outline-none"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[120px]">
                                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Free Plan</p>
                                </div>
                                <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {(user.user_metadata?.full_name?.[0] || user.email?.[0])?.toUpperCase()}
                                </div>
                                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 top-12 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.user_metadata?.full_name || 'User'}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>

                                    <div className="px-2 space-y-1">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2.5 h-9 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl"
                                            onClick={() => { setIsProfileOpen(false); router.push('/profile'); }}
                                        >
                                            <User className="w-4 h-4" />
                                            Profile Settings
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2.5 h-9 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl"
                                            onClick={() => { setIsProfileOpen(false); router.push('/billing'); }}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Billing & Payments
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2.5 h-9 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl"
                                            onClick={() => { setIsProfileOpen(false); router.push('/subscription'); }}
                                        >
                                            <Award className="w-4 h-4" />
                                            Upgrade Storage
                                        </Button>
                                    </div>

                                    <div className="mt-1 px-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2.5 h-9 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                                            onClick={async () => {
                                                await supabase.auth.signOut()
                                                router.push('/login')
                                            }}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 space-x-2">
                        <button
                            onClick={() => navigateUp(-1)}
                            className="hover:text-orange-600 dark:hover:text-orange-400 font-semibold transition-colors"
                        >
                            Home
                        </button>
                        {currentPath.map((folder, index) => (
                            <div key={index} className="flex items-center">
                                <ChevronRight className="w-4 h-4 mx-1 text-slate-300 dark:text-slate-700" />
                                <button
                                    onClick={() => navigateUp(index)}
                                    className={cn(
                                        "hover:text-orange-600 dark:hover:text-orange-400 transition-colors",
                                        index === currentPath.length - 1 && "font-bold text-slate-900 dark:text-slate-100 pointer-events-none"
                                    )}
                                >
                                    {folder}
                                </button>
                            </div>
                        ))}
                    </nav>

                    {/* Header Banner */}
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                                    {view === 'files' ? 'Cloud Explorer' :
                                        view === 'recent' ? 'Recent Files' :
                                            view === 'starred' ? 'Starred Files' :
                                                view === 'shared' ? 'Shared with Me' :
                                                    view === 'trash' ? 'Trash' : 'Cloud Explorer'}
                                    <span className="text-xs font-bold px-2.5 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full border border-orange-200 dark:border-orange-900/50">
                                        {filteredFiles.length} items
                                    </span>
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {view === 'files' ? 'Organize, tag, and inspect your secure vault storage' :
                                        view === 'recent' ? 'Your recently created and uploaded files' :
                                            view === 'starred' ? 'Your pinned favorite files' :
                                                view === 'shared' ? 'Files shared with you by team members' :
                                                    view === 'trash' ? 'Items in trash can be restored or permanently deleted' : ''}
                                </p>
                            </div>

                            {/* Actions Header */}
                            <div className="flex items-center gap-2">
                                {view === 'files' && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDashboardStats(!showDashboardStats)}
                                            className="text-xs font-semibold text-slate-600 dark:text-slate-300 gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800"
                                        >
                                            <BarChart3 className="w-4 h-4 text-orange-500" />
                                            {showDashboardStats ? 'Hide Stats' : 'Show Stats'}
                                        </Button>

                                        {!isCreatingFolder ? (
                                            <Button
                                                variant="outline"
                                                className="gap-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl"
                                                onClick={() => setIsCreatingFolder(true)}
                                            >
                                                <FolderPlus className="w-4 h-4 text-orange-500" />
                                                New Folder
                                            </Button>
                                        ) : (
                                            <form onSubmit={handleCreateFolder} className="flex items-center gap-2 max-w-sm bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                                                <Input
                                                    placeholder="Folder Name"
                                                    value={newFolderName}
                                                    onChange={(e) => setNewFolderName(e.target.value)}
                                                    autoFocus
                                                    className="h-9 text-xs border-slate-200 dark:border-slate-700"
                                                />
                                                <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold">Create</Button>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreatingFolder(false)} className="rounded-xl text-xs">Cancel</Button>
                                            </form>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Interactive Dashboard Overview Stat Cards */}
                        {view === 'files' && currentPath.length === 0 && showDashboardStats && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-2 animate-fade-in-up">
                                {/* Documents Card */}
                                <div 
                                    onClick={() => setSelectedCategory(selectedCategory === 'documents' ? 'all' : 'documents')} 
                                    className={cn(
                                        "p-5 rounded-3xl border transition-all cursor-pointer group hover:scale-[1.02]",
                                        selectedCategory === 'documents' 
                                            ? "bg-blue-500/10 border-blue-500 shadow-lg" 
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            Docs
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{docsFiles.length} <span className="text-xs font-normal text-slate-400">files</span></h3>
                                    <p className="text-xs text-slate-400 mt-1">{formatFileSize(docsSize)} total space</p>
                                </div>

                                {/* Images Card */}
                                <div 
                                    onClick={() => setSelectedCategory(selectedCategory === 'images' ? 'all' : 'images')} 
                                    className={cn(
                                        "p-5 rounded-3xl border transition-all cursor-pointer group hover:scale-[1.02]",
                                        selectedCategory === 'images' 
                                            ? "bg-emerald-500/10 border-emerald-500 shadow-lg" 
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            Images
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{imgsFiles.length} <span className="text-xs font-normal text-slate-400">files</span></h3>
                                    <p className="text-xs text-slate-400 mt-1">{formatFileSize(imgsSize)} total space</p>
                                </div>

                                {/* Videos Card */}
                                <div 
                                    onClick={() => setSelectedCategory(selectedCategory === 'videos' ? 'all' : 'videos')} 
                                    className={cn(
                                        "p-5 rounded-3xl border transition-all cursor-pointer group hover:scale-[1.02]",
                                        selectedCategory === 'videos' 
                                            ? "bg-purple-500/10 border-purple-500 shadow-lg" 
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:scale-110 transition-transform">
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            Videos
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{vidsFiles.length} <span className="text-xs font-normal text-slate-400">files</span></h3>
                                    <p className="text-xs text-slate-400 mt-1">{formatFileSize(vidsSize)} total space</p>
                                </div>

                                {/* Audio Card */}
                                <div 
                                    onClick={() => setSelectedCategory(selectedCategory === 'audio' ? 'all' : 'audio')} 
                                    className={cn(
                                        "p-5 rounded-3xl border transition-all cursor-pointer group hover:scale-[1.02]",
                                        selectedCategory === 'audio' 
                                            ? "bg-amber-500/10 border-amber-500 shadow-lg" 
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                                            <Music className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            Audio
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{audioFiles.length} <span className="text-xs font-normal text-slate-400">files</span></h3>
                                    <p className="text-xs text-slate-400 mt-1">{formatFileSize(audioSize)} total space</p>
                                </div>
                            </div>
                        )}

                        {/* Category & Tag Filter Pills */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                {[
                                    { id: 'all', label: 'All Categories' },
                                    { id: 'documents', label: 'Documents' },
                                    { id: 'images', label: 'Images' },
                                    { id: 'videos', label: 'Videos' },
                                    { id: 'audio', label: 'Audio' }
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                                            selectedCategory === cat.id
                                                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                                        )}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tag Filter Chips */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> Tags:
                                </span>
                                {[
                                    { id: 'all', label: 'All Tags' },
                                    { id: 'Important', color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-300' },
                                    { id: 'Work', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-300' },
                                    { id: 'Personal', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-300' },
                                    { id: 'Draft', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-300' }
                                ].map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => setSelectedTagFilter(tag.id)}
                                        className={cn(
                                            "px-2.5 py-1 rounded-lg font-semibold text-[11px] border transition-all",
                                            selectedTagFilter === tag.id
                                                ? "ring-2 ring-orange-500 font-bold"
                                                : "opacity-80 hover:opacity-100",
                                            tag.color || "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                        )}
                                    >
                                        {tag.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Folders Section */}
                    {filteredFolders.length > 0 && view !== 'trash' && (
                        <section className="mb-8 animate-fade-in-up">
                            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <FolderIcon className="w-3.5 h-3.5 text-orange-500" /> Folders ({filteredFolders.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredFolders.map((folder, index) => (
                                    <div
                                        key={folder.name}
                                        style={{ animationDelay: `${index * 40}ms` }}
                                        className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg hover:border-orange-500/50 transition-all cursor-pointer animate-fade-in-up"
                                        onClick={() => navigateToFolder(folder.name)}
                                    >
                                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-200 dark:border-orange-900/50">
                                            <FolderIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate text-sm">{folder.name}</h3>
                                            <p className="text-xs text-slate-400">Directory</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Files Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileIcon className="w-3.5 h-3.5 text-blue-500" /> Files ({filteredFiles.length})
                            </h2>

                            {filteredFiles.length > 0 && (
                                <button
                                    onClick={() => toggleSelectAll(filteredFiles)}
                                    className="text-xs font-bold text-slate-500 hover:text-orange-500 flex items-center gap-1 transition-colors"
                                >
                                    {selectedFiles.length === filteredFiles.length ? (
                                        <><CheckSquare className="w-4 h-4 text-orange-500" /> Deselect All</>
                                    ) : (
                                        <><Square className="w-4 h-4" /> Select All</>
                                    )}
                                </button>
                            )}
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredFiles.map((file, index) => {
                                    const style = getFileIconAndColor(file.name)
                                    const isStarred = starred.includes(file.name)
                                    const isSelected = selectedFiles.includes(file.name)
                                    const fileTag = fileTags[file.name]
                                    const isTagMenuOpen = activeTagMenuFile === file.name

                                    return (
                                        <Card 
                                            key={file.id || file.name}
                                            style={{ animationDelay: `${index * 35}ms` }}
                                            className={cn(
                                                "group relative hover:shadow-xl transition-all duration-300 border bg-white dark:bg-slate-900 rounded-3xl overflow-hidden animate-fade-in-up flex flex-col",
                                                isSelected 
                                                    ? "ring-2 ring-orange-500 border-orange-500 bg-orange-500/5 dark:bg-orange-500/10" 
                                                    : "border-slate-200 dark:border-slate-800",
                                                style.glowColor
                                            )}
                                        >
                                            <CardContent className="p-5 flex flex-col flex-1">
                                                {/* Card Header: Checkbox + Extension Badge + Quick Actions */}
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); toggleSelectFile(file.name); }}
                                                            className="text-slate-400 hover:text-orange-500 transition-colors"
                                                        >
                                                            {isSelected ? (
                                                                <CheckSquare className="w-5 h-5 text-orange-500" />
                                                            ) : (
                                                                <Square className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                                                            )}
                                                        </button>
                                                        <span className={cn("px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border tracking-wider", style.badge)}>
                                                            {style.extLabel}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        {view !== 'trash' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn("h-7 w-7 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 rounded-lg", isStarred && "text-amber-500")}
                                                                title={isStarred ? "Unstar" : "Star"}
                                                                onClick={() => toggleStar(file.name)}
                                                            >
                                                                <Star className={cn("w-3.5 h-3.5", isStarred && "fill-current")} />
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 rounded-lg" 
                                                            title="Inspect Properties" 
                                                            onClick={() => setInspectedFile(file)}
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Hero Icon Preview Box (Spacious) */}
                                                <div 
                                                    onClick={() => setInspectedFile(file)}
                                                    className="h-28 flex items-center justify-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl mb-4 cursor-pointer group-hover:scale-[1.02] transition-transform duration-300 border border-slate-100 dark:border-slate-800"
                                                >
                                                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                                                        {style.icon}
                                                    </div>
                                                </div>

                                                {/* File Title & Details */}
                                                <div className="cursor-pointer mb-3" onClick={() => setSelectedFileForPreview(file)}>
                                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm mb-1" title={file.name}>
                                                        {file.name}
                                                    </h3>
                                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                                        <span>{formatFileSize(file.metadata?.size)}</span>
                                                        <span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Today'}</span>
                                                    </div>
                                                </div>

                                                {/* Card Footer: Clean Tag & Action Buttons */}
                                                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between relative">
                                                    {fileTag ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className={cn(
                                                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1",
                                                                fileTag === 'Important' && "bg-red-500/15 text-red-600 dark:text-red-300 border-red-300",
                                                                fileTag === 'Work' && "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-300",
                                                                fileTag === 'Personal' && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-300",
                                                                fileTag === 'Draft' && "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-300"
                                                            )}>
                                                                ● {fileTag}
                                                            </span>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleSetTag(file.name, fileTag); }}
                                                                className="text-slate-400 hover:text-rose-500 text-xs"
                                                                title="Remove tag"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setActiveTagMenuFile(isTagMenuOpen ? null : file.name); }}
                                                            className="text-[11px] font-semibold text-slate-400 hover:text-orange-500 flex items-center gap-1"
                                                        >
                                                            <Tag className="w-3 h-3" /> + Tag
                                                        </button>
                                                    )}

                                                    {/* On-Demand Tag Picker Popover */}
                                                    {isTagMenuOpen && (
                                                        <div className="absolute bottom-10 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-30 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                                                            {['Important', 'Work', 'Personal', 'Draft'].map(tag => (
                                                                <button
                                                                    key={tag}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleSetTag(file.name, tag)
                                                                        setActiveTagMenuFile(null)
                                                                    }}
                                                                    className="px-2 py-1 text-[10px] font-bold rounded-lg hover:opacity-80 transition-opacity"
                                                                    style={{
                                                                        backgroundColor: tag === 'Important' ? '#ef444420' : tag === 'Work' ? '#3b82f620' : tag === 'Personal' ? '#10b98120' : '#f59e0b20',
                                                                        color: tag === 'Important' ? '#ef4444' : tag === 'Work' ? '#3b82f6' : tag === 'Personal' ? '#10b981' : '#f59e0b'
                                                                    }}
                                                                >
                                                                    {tag}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Right Actions */}
                                                    <div className="flex items-center gap-1">
                                                        {view !== 'trash' ? (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-orange-600 rounded-lg" title="Download" onClick={() => handleDownload(file.name)}>
                                                                    <DownloadIcon className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-orange-600 rounded-lg" title="Share" onClick={() => handleShare(file.name)}>
                                                                    <Share2Icon className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-rose-500 rounded-lg" title="Move to Trash" onClick={() => handleDelete(file.name)}>
                                                                    <Trash2Icon className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 rounded-lg" title="Restore File" onClick={() => handleRestore(file.name)}>
                                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500 rounded-lg" title="Delete Permanently" onClick={() => handleDelete(file.name)}>
                                                                    <Trash2Icon className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-fade-in-up">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-4 py-4 w-10 text-center">
                                                <button onClick={() => toggleSelectAll(filteredFiles)}>
                                                    <Square className="w-4 h-4 opacity-50" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-4 py-4">Tag</th>
                                            <th className="px-6 py-4">Size</th>
                                            <th className="px-6 py-4">Date Modified</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredFiles.map((file) => {
                                            const style = getFileIconAndColor(file.name)
                                            const isStarred = starred.includes(file.name)
                                            const isSelected = selectedFiles.includes(file.name)
                                            const fileTag = fileTags[file.name]
                                            return (
                                                <tr key={file.id || file.name} className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group", isSelected && "bg-orange-500/5 dark:bg-orange-500/10")}>
                                                    <td className="px-4 py-4 text-center">
                                                        <button onClick={() => toggleSelectFile(file.name)}>
                                                            {isSelected ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4 opacity-30 group-hover:opacity-100" />}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedFileForPreview(file)}>
                                                        <div className="flex items-center gap-3">
                                                            {style.icon}
                                                            <div>
                                                                <span className="font-semibold text-slate-900 dark:text-slate-100 block">{file.name}</span>
                                                                <span className={cn("text-[9px] px-1.5 py-0.2 rounded uppercase font-bold border", style.badge)}>
                                                                    {style.extLabel}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {fileTag ? (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                                ● {fileTag}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatFileSize(file.metadata?.size)}</td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Today'}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {view !== 'trash' ? (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className={cn("h-8 w-8 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 rounded-lg", isStarred && "text-amber-500")}
                                                                        title={isStarred ? "Unstar" : "Star"}
                                                                        onClick={() => toggleStar(file.name)}
                                                                    >
                                                                        <Star className={cn("w-4 h-4", isStarred && "fill-current")} />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 rounded-lg" title="Preview" onClick={() => setSelectedFileForPreview(file)}>
                                                                        <Eye className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 rounded-lg" title="Download" onClick={() => handleDownload(file.name)}>
                                                                        <DownloadIcon className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 rounded-lg" title="Share" onClick={() => handleShare(file.name)}>
                                                                        <Share2Icon className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 rounded-lg" title="Move to Trash" onClick={() => handleDelete(file.name)}>
                                                                        <Trash2Icon className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg" title="Restore File" onClick={() => handleRestore(file.name)}>
                                                                        <RotateCcw className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg" title="Delete Permanently" onClick={() => handleDelete(file.name)}>
                                                                        <Trash2Icon className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {filteredFiles.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 shadow-xs animate-fade-in-up">
                                <div className="inline-block p-4 bg-orange-50 dark:bg-orange-950/40 text-orange-500 rounded-full mb-4">
                                    <CloudUpload className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No files found</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Upload files or drag and drop anywhere on the screen</p>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            {/* Floating Action Bar (FAB) for Multi-Select Batch Actions */}
            {selectedFiles.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 backdrop-blur-lg px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-4 animate-slide-up border border-slate-700 dark:border-slate-200">
                    <span className="text-xs font-extrabold tracking-wide">
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="h-4 w-[1px] bg-slate-700 dark:bg-slate-300" />
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-full h-8 gap-1.5"
                            onClick={handleBatchDownload}
                        >
                            <DownloadIcon className="w-3.5 h-3.5" /> Download
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs font-bold rounded-full h-8 gap-1.5"
                            onClick={handleBatchStar}
                        >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> Star
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs font-bold rounded-full h-8 gap-1.5"
                            onClick={handleBatchDelete}
                        >
                            <Trash2Icon className="w-3.5 h-3.5" /> Trash
                        </Button>
                        <button
                            onClick={() => setSelectedFiles([])}
                            className="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-900"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Share Dialog */}
            <ShareDialog
                isOpen={shareDialogOpen}
                onClose={() => setShareDialogOpen(false)}
                filePath={fileToShare}
            />

            {/* File Preview Details Modal */}
            <Dialog open={!!selectedFileForPreview} onOpenChange={() => setSelectedFileForPreview(null)}>
                {selectedFileForPreview && (
                    <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold truncate pr-6">{selectedFileForPreview.name}</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                                File Details & Direct Actions
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex flex-col items-center text-center border border-slate-100 dark:border-slate-800">
                                {getFileIconAndColor(selectedFileForPreview.name).icon}
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-3 break-all text-sm">{selectedFileForPreview.name}</h4>
                                <p className="text-xs text-slate-400 mt-1">{formatFileSize(selectedFileForPreview.metadata?.size)}</p>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">File Format</span>
                                    <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{selectedFileForPreview.name.split('.').pop() || 'File'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Created Date</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFileForPreview.created_at ? new Date(selectedFileForPreview.created_at).toLocaleString() : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Tag</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{fileTags[selectedFileForPreview.name] || 'None'}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Starred Status</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{starred.includes(selectedFileForPreview.name) ? 'Starred ★' : 'Normal'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                className="rounded-xl border-slate-200 dark:border-slate-700"
                                onClick={() => {
                                    handleShare(selectedFileForPreview.name)
                                    setSelectedFileForPreview(null)
                                }}
                            >
                                <Share2Icon className="w-4 h-4 mr-2" /> Share
                            </Button>
                            <Button
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl"
                                onClick={() => {
                                    handleDownload(selectedFileForPreview.name)
                                    setSelectedFileForPreview(null)
                                }}
                            >
                                <DownloadIcon className="w-4 h-4 mr-2" /> Download
                            </Button>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
            {/* Figma-Style File Inspector Side Drawer */}
            <FileInspector
                file={inspectedFile}
                onClose={() => setInspectedFile(null)}
                onDownload={handleDownload}
                onShare={handleShare}
                onDelete={handleDelete}
                onToggleStar={toggleStar}
                isStarred={inspectedFile ? starred.includes(inspectedFile.name) : false}
                currentTag={inspectedFile ? fileTags[inspectedFile.name] : null}
                onSetTag={handleSetTag}
                onOpenChatWithPrompt={(promptText) => {
                    addToast(`AI Prompt: ${promptText}`, 'info')
                }}
            />

            {/* Command Palette Modal (Ctrl+K) */}
            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                files={files}
                onSelectView={(v) => setView(v)}
                onSelectFile={(f) => setInspectedFile(f)}
                onUploadClick={() => fileInputRef.current?.click()}
                onCreateFolderClick={() => setIsCreatingFolder(true)}
            />

            {/* Storage Analytics Modal */}
            <StorageAnalyticsModal
                isOpen={analyticsOpen}
                onClose={() => setAnalyticsOpen(false)}
                files={files}
                onEmptyTrash={() => { setView('trash'); addToast('Purging trash vault items...', 'info'); }}
                onFilterLargeFiles={() => { setSelectedCategory('all'); setSearchQuery(''); addToast('Showing large files', 'info'); }}
            />

            {/* Activity Log Feed Modal */}
            <ActivityLogModal
                isOpen={activityLogOpen}
                onClose={() => setActivityLogOpen(false)}
            />
        </div>
    )
}

