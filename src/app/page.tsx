'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FileIcon, Trash2Icon, DownloadIcon, CloudUpload, Share2Icon, FolderIcon, ChevronRight, FolderPlus, Cloud, Star, Clock, User, Settings, HardDrive, Search, Bell, Menu, ChevronDown, CreditCard, Award, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import { useToast } from '@/components/ui/toast'
import { useTheme } from 'next-themes'
import { Sun, Moon, LayoutGrid, List as ListIcon } from 'lucide-react'

type FileObject = {
    name: string
    id: string
    updated_at: string
    created_at: string
    last_accessed_at: string
    metadata: Record<string, any>
}

export default function Dashboard() {
    const supabase = createClient()
    const router = useRouter()
    const [files, setFiles] = useState<FileObject[]>([])
    const [folders, setFolders] = useState<FileObject[]>([])
    const [uploading, setUploading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [currentPath, setCurrentPath] = useState<string[]>([])
    const [newFolderName, setNewFolderName] = useState('')
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const { addToast } = useToast()
    const { theme, setTheme } = useTheme()

    // Calculate storage usage (mock limit 10GB)
    const totalSize = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0)
    const totalSizeGB = totalSize / (1024 * 1024 * 1024)
    const limitGB = 10
    const usagePercentage = Math.min((totalSizeGB / limitGB) * 100, 100)

    const [view, setView] = useState<'files' | 'started' | 'recent' | 'trash'>('files')
    const [starred, setStarred] = useState<string[]>([])

    // Load starred files from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('starredFiles')
        if (saved) {
            setStarred(JSON.parse(saved))
        }
    }, [])

    const toggleStar = (fileName: string) => {
        const newStarred = starred.includes(fileName)
            ? starred.filter(name => name !== fileName)
            : [...starred, fileName]
        setStarred(newStarred)
        localStorage.setItem('starredFiles', JSON.stringify(newStarred))
    }

    const fetchFiles = useCallback(async (userId: string, path: string[]) => {
        let pathString = path.length > 0 ? `${userId}/${path.join('/')}/` : `${userId}/`

        // Adjust path for Trash view
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
            let filesList = data.filter(item => item.metadata)

            // Filter for Starred view
            if (view === 'started') {
                // For starred, we can't easily fetch across folders without DB. 
                // We'll just filter valid items in CURRENT view that are starred for now, 
                // or effectively just show starred items in the current folder. 
                // TO DO: Real implementation needs DB. 
                // For now, let's just filter the current list.
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
            if (!user) {
                router.push('/login')
            } else {
                setUser(user)
                fetchFiles(user.id, currentPath)
            }
        }
        getUser()
    }, [router, supabase, currentPath, fetchFiles])

    const handleDelete = async (fileName: string) => {
        if (view === 'trash') {
            // Permanent Delete
            const { error } = await supabase.storage
                .from('files')
                .remove([`${user.id}/.trash/${fileName}`])
            if (!error) fetchFiles(user.id, [])
        } else {
            // Move to Trash
            const pathString = currentPath.length > 0 ? `${currentPath.join('/')}/` : ''
            const { error } = await supabase.storage
                .from('files')
                .move(`${user.id}/${pathString}${fileName}`, `${user.id}/.trash/${fileName}`)

            if (!error) {
                fetchFiles(user.id, currentPath)
            } else {
                console.error("Error moving to trash:", error)
            }
        }
    }

    // ... (rest of existing code)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }

        setUploading(true)
        const file = e.target.files[0]
        const pathString = currentPath.length > 0 ? `${currentPath.join('/')}/` : ''
        const filePath = `${user.id}/${pathString}${file.name}`

        const { error: uploadError } = await supabase.storage
            .from('files')
            .upload(filePath, file)

        if (uploadError) {
            addToast('Error uploading file!', 'error')
            console.log(uploadError)
        } else {
            addToast('File uploaded successfully!', 'success')
            fetchFiles(user.id, currentPath)
        }
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleCreateFolder = async (e: React.FormEvent) => {
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

    const handleDownload = async (fileName: string) => {
        const pathString = currentPath.length > 0 ? `${currentPath.join('/')}/` : ''
        const { data, error } = await supabase.storage
            .from('files')
            .download(`${user.id}/${pathString}${fileName}`)

        if (error) {
            console.error(error)
            return
        }

        const url = URL.createObjectURL(data)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
    }

    const handleShare = async (fileName: string) => {
        const pathString = currentPath.length > 0 ? `${currentPath.join('/')}/` : ''
        const { data, error } = await supabase.storage
            .from('files')
            .createSignedUrl(`${user.id}/${pathString}${fileName}`, 3600)

        if (data) {
            await navigator.clipboard.writeText(data.signedUrl)
            addToast('Share link copied to clipboard! (Valid for 1 hour)', 'success')
        } else {
            console.error(error)
            addToast('Error creating share link', 'error')
        }
    }

    const navigateToFolder = (folderName: string) => {
        setCurrentPath([...currentPath, folderName])
    }

    const navigateUp = (index: number) => {
        if (index === -1) {
            setCurrentPath([])
        } else {
            setCurrentPath(currentPath.slice(0, index + 1))
        }
    }

    // Helper for file icons and colors
    const getFileIconAndColor = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase() || ''
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
            return { icon: <div className="p-3 bg-green-100 rounded-xl"><FileIcon className="w-6 h-6 text-green-600" /></div>, color: 'text-green-600', bgColor: 'bg-green-100' }
        }
        if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
            return { icon: <div className="p-3 bg-blue-100 rounded-xl"><FileIcon className="w-6 h-6 text-blue-600" /></div>, color: 'text-blue-600', bgColor: 'bg-blue-100' }
        }
        if (['mp4', 'mov', 'avi'].includes(ext)) {
            return { icon: <div className="p-3 bg-red-100 rounded-xl"><FileIcon className="w-6 h-6 text-red-600" /></div>, color: 'text-red-600', bgColor: 'bg-red-100' }
        }
        if (['mp3', 'wav'].includes(ext)) {
            return { icon: <div className="p-3 bg-yellow-100 rounded-xl"><FileIcon className="w-6 h-6 text-yellow-600" /></div>, color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
        }
        return { icon: <div className="p-3 bg-gray-100 rounded-xl"><FileIcon className="w-6 h-6 text-gray-600" /></div>, color: 'text-gray-600', bgColor: 'bg-gray-100' }
    }

    // Filter files based on search
    const filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const filteredFolders = folders.filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!user) return <div className="h-screen flex items-center justify-center text-orange-500">Loading...</div>

    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-100 flex flex-col bg-white flex-shrink-0">
                <div className="p-6 flex items-center gap-2">
                    <div className="bg-orange-500 p-2 rounded-lg">
                        <Cloud className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">NimbusVault</span>
                </div>

                <div className="px-6 mb-6">
                    <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all h-12 text-base"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : '+ Upload File'}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-3 font-medium", view === 'files' ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}
                        onClick={() => { setView('files'); setCurrentPath([]); }}
                    >
                        <FolderIcon className="w-5 h-5" />
                        My Files
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                        <User className="w-5 h-5" />
                        Shared with Me
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-3 font-medium", view === 'started' ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}
                        onClick={() => { setView('started'); setCurrentPath([]); }}
                    >
                        <Star className="w-5 h-5" />
                        Starred
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-3 font-medium", view === 'recent' ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}
                        onClick={() => { setView('recent'); setCurrentPath([]); }}
                    >
                        <Clock className="w-5 h-5" />
                        Recent
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn("w-full justify-start gap-3 font-medium", view === 'trash' ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50")}
                        onClick={() => { setView('trash'); setCurrentPath([]); }}
                    >
                        <Trash2Icon className="w-5 h-5" />
                        Trash
                    </Button>
                </nav>

                <div className="p-6 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                        <HardDrive className="w-4 h-4" />
                        <span>Storage</span>
                        <span className="ml-auto text-xs text-gray-500">{totalSizeGB.toFixed(1)} GB / 10 GB</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${usagePercentage}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400 mb-6">{Math.round(usagePercentage)}% used</p>

                    <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500 hover:text-gray-900 px-0" onClick={async () => {
                        await supabase.auth.signOut()
                        router.push('/login')
                    }}>
                        <Settings className="w-5 h-5" />
                        Settings
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Bar */}
                <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white flex-shrink-0">
                    {/* Search */}
                    <div className="flex-1 max-w-xl relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search files, folders..."
                            className="bg-gray-50 border-transparent focus:bg-white transition-all pl-10 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4 ml-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow text-orange-500" : "text-gray-400 hover:text-gray-600")}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white shadow text-orange-500" : "text-gray-400 hover:text-gray-600")}
                                title="List View"
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <Button variant="ghost" size="icon" className="text-gray-500 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </Button>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 pl-4 border-l border-gray-100 focus:outline-none"
                            >
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-medium text-gray-700 leading-none">
                                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">Free Plan</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                    {(user.user_metadata?.full_name?.[0] || user.email?.[0])?.toUpperCase()}
                                </div>
                                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user.user_metadata?.full_name || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>

                                    <div className="px-2 space-y-1">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2 h-9 text-sm font-normal text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-500"
                                            onClick={() => router.push('/profile')}
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2 h-9 text-sm font-normal text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-500"
                                            onClick={() => router.push('/billing')}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Billing
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2 h-9 text-sm font-normal text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-500"
                                            onClick={() => router.push('/subscription')}
                                        >
                                            <Award className="w-4 h-4" />
                                            Subscription
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2 h-9 text-sm font-normal text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-500"
                                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                        >
                                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                        </Button>
                                    </div>

                                    <div className="mt-1 px-2 pt-1 border-t border-gray-50">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2 h-9 text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
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
                <main className="flex-1 overflow-y-auto p-8 bg-white">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center text-sm text-gray-500 mb-8 space-x-2">
                        <button
                            onClick={() => navigateUp(-1)}
                            className="hover:text-orange-600 font-medium transition-colors"
                        >
                            Home
                        </button>
                        {currentPath.map((folder, index) => (
                            <div key={index} className="flex items-center">
                                <ChevronRight className="w-4 h-4 mx-1 text-gray-300" />
                                <button
                                    onClick={() => navigateUp(index)}
                                    className={cn(
                                        "hover:text-orange-600 transition-colors",
                                        index === currentPath.length - 1 && "font-bold text-gray-900 pointer-events-none"
                                    )}
                                >
                                    {folder}
                                </button>
                            </div>
                        ))}
                    </nav>

                    <div className="mb-4 flex flex-col gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {view === 'files' ? 'My Files' :
                                    view === 'recent' ? 'Recent Files' :
                                        view === 'started' ? 'Starred Files' :
                                            view === 'trash' ? 'Trash' : 'My Files'}
                            </h1>
                            <p className="text-gray-500">
                                {view === 'files' ? 'Manage and organize your cloud storage' :
                                    view === 'recent' ? 'Your recently created files' :
                                        view === 'started' ? 'Your favorite files' :
                                            view === 'trash' ? 'Files in trash will be deleted after 30 days' : ''}
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Documents */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <FileIcon className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {files.filter(f => ['pdf', 'doc', 'docx', 'txt'].includes(f.name.split('.').pop()?.toLowerCase() || '')).length}
                                    </p>
                                    <p className="text-sm text-gray-500">Documents • {(files.filter(f => ['pdf', 'doc', 'docx', 'txt'].includes(f.name.split('.').pop()?.toLowerCase() || '')).reduce((acc, f) => acc + (f.metadata?.size || 0), 0) / (1024 * 1024 * 1024)).toFixed(1)} GB</p>
                                </div>
                            </div>

                            {/* Images */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <FileIcon className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {files.filter(f => ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(f.name.split('.').pop()?.toLowerCase() || '')).length}
                                    </p>
                                    <p className="text-sm text-gray-500">Images • {(files.filter(f => ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(f.name.split('.').pop()?.toLowerCase() || '')).reduce((acc, f) => acc + (f.metadata?.size || 0), 0) / (1024 * 1024 * 1024)).toFixed(1)} GB</p>
                                </div>
                            </div>

                            {/* Videos */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <FileIcon className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {files.filter(f => ['mp4', 'mov', 'avi'].includes(f.name.split('.').pop()?.toLowerCase() || '')).length}
                                    </p>
                                    <p className="text-sm text-gray-500">Videos • {(files.filter(f => ['mp4', 'mov', 'avi'].includes(f.name.split('.').pop()?.toLowerCase() || '')).reduce((acc, f) => acc + (f.metadata?.size || 0), 0) / (1024 * 1024 * 1024)).toFixed(1)} GB</p>
                                </div>
                            </div>

                            {/* Total Files */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-orange-50 rounded-xl">
                                    <HardDrive className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{files.length}</p>
                                    <p className="text-sm text-gray-500">Total Files • {(files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0) / (1024 * 1024 * 1024)).toFixed(1)} GB</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            {/* Create Folder */}
                            {!isCreatingFolder ? (
                                <Button
                                    variant="outline"
                                    className="gap-2 border-dashed border-gray-300 text-gray-500 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl"
                                    onClick={() => setIsCreatingFolder(true)}
                                >
                                    <FolderPlus className="w-4 h-4" />
                                    New Folder
                                </Button>
                            ) : (
                                <form onSubmit={handleCreateFolder} className="flex items-center gap-2 max-w-sm">
                                    <Input
                                        placeholder="Folder Name"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        autoFocus
                                        className="h-9"
                                    />
                                    <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">Create</Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreatingFolder(false)}>Cancel</Button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Folders Section */}
                    {filteredFolders.length > 0 && (
                        <section className="mb-10">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                Folders
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredFolders.map((folder, i) => {
                                    const color = { bg: 'bg-orange-50', text: 'text-orange-500' }

                                    return (
                                        <div
                                            key={folder.name}
                                            className="group relative bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg hover:border-orange-100 transition-all cursor-pointer"
                                            onClick={() => navigateToFolder(folder.name)}
                                        >
                                            <div className={cn("p-3 rounded-xl", color.bg)}>
                                                <FolderIcon className={cn("w-6 h-6", color.text)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-700 truncate">{folder.name}</h3>
                                                <p className="text-xs text-gray-400">Folder</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Files Section */}
                    <section>
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Files
                            </h2>
                            <span className="text-xs text-gray-400">{filteredFiles.length} items</span>
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredFiles.map((file) => {
                                    const style = getFileIconAndColor(file.name)
                                    return (
                                        <Card key={file.id} className="group hover:shadow-xl transition-all border-gray-100 rounded-2xl overflow-hidden hover:-translate-y-1 duration-300">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    {style.icon}
                                                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={cn("h-8 w-8 hover:bg-orange-50 hover:text-orange-600", starred.includes(file.name) && "text-orange-500")}
                                                            title={starred.includes(file.name) ? "Unstar" : "Star"}
                                                            onClick={() => toggleStar(file.name)}
                                                        >
                                                            <Star className={cn("w-4 h-4", starred.includes(file.name) && "fill-current")} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600" title="Download" onClick={() => handleDownload(file.name)}>
                                                            <DownloadIcon className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600" title="Share" onClick={() => handleShare(file.name)}>
                                                            <Share2Icon className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:bg-red-50 hover:text-red-500" title={view === 'trash' ? "Delete Permanently" : "Move to Trash"} onClick={() => handleDelete(file.name)}>
                                                            <Trash2Icon className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 truncate mb-1" title={file.name}>{file.name}</h3>
                                                    <div className="flex items-center text-xs text-gray-400 gap-2">
                                                        <span>{(file.metadata?.size / 1024).toFixed(1)} KB</span>
                                                        <span>•</span>
                                                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Size</th>
                                            <th className="px-6 py-4">Date Modified</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredFiles.map((file) => {
                                            const style = getFileIconAndColor(file.name)
                                            return (
                                                <tr key={file.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("p-2 rounded-lg", style.bgColor)}>
                                                                {style.icon}
                                                            </div>
                                                            <span className="font-medium text-gray-900">{file.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">{(file.metadata?.size / 1024).toFixed(1)} KB</td>
                                                    <td className="px-6 py-4 text-gray-500">{new Date(file.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn("h-8 w-8 hover:bg-orange-50 hover:text-orange-600", starred.includes(file.name) && "text-orange-500")}
                                                                title={starred.includes(file.name) ? "Unstar" : "Star"}
                                                                onClick={() => toggleStar(file.name)}
                                                            >
                                                                <Star className={cn("w-4 h-4", starred.includes(file.name) && "fill-current")} />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600" title="Download" onClick={() => handleDownload(file.name)}>
                                                                <DownloadIcon className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600" title="Share" onClick={() => handleShare(file.name)}>
                                                                <Share2Icon className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:bg-red-50 hover:text-red-500" title={view === 'trash' ? "Delete Permanently" : "Move to Trash"} onClick={() => handleDelete(file.name)}>
                                                                <Trash2Icon className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {files.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                                    <CloudUpload className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No files yet</h3>
                                <p className="text-gray-500 mt-1">Upload files or create a folder to get started</p>
                            </div>
                        )}
                    </section>
                </main>
            </div >
        </div >
    )
}
