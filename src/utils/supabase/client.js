import { createBrowserClient } from '@supabase/ssr'

function getDemoUser() {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem('demo_user')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function setDemoUser(user) {
  if (typeof window === 'undefined') return
  try {
    if (user) {
      localStorage.setItem('demo_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('demo_user')
    }
  } catch (e) {
    console.error(e)
  }
}

function getDemoFiles(pathString) {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('demo_files') || '[]'
    const files = JSON.parse(saved)
    return files.filter(f => f.path === pathString)
  } catch {
    return []
  }
}

function saveDemoFile(filePath, file) {
  if (typeof window === 'undefined') return
  try {
    const parts = filePath.split('/')
    const fileName = parts.pop()
    const folderPath = parts.join('/') + '/'
    const saved = localStorage.getItem('demo_files') || '[]'
    const files = JSON.parse(saved)
    const newFile = {
      name: fileName,
      id: Date.now().toString(),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      metadata: {
        size: file.size,
        mimetype: file.type,
      },
      path: folderPath
    }
    const filtered = files.filter(f => !(f.path === folderPath && f.name === fileName))
    filtered.push(newFile)
    localStorage.setItem('demo_files', JSON.stringify(filtered))
  } catch (e) {
    console.error(e)
  }
}

function removeDemoFile(filePath) {
  if (typeof window === 'undefined') return
  try {
    const saved = localStorage.getItem('demo_files') || '[]'
    const files = JSON.parse(saved)
    const filtered = files.filter(f => f.path + f.name !== filePath)
    localStorage.setItem('demo_files', JSON.stringify(filtered))
  } catch (e) {
    console.error(e)
  }
}

function seedInitialDemoFiles(userId) {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem('demo_files_seeded')) return
    const now = new Date().toISOString()
    const initialFiles = [
      {
        name: 'Projects',
        id: 'dir-1',
        updated_at: now,
        created_at: now,
        path: `${userId}/`
      },
      {
        name: 'Design Assets',
        id: 'dir-2',
        updated_at: now,
        created_at: now,
        path: `${userId}/`
      },
      {
        name: 'NimbusVault_Architecture.pdf',
        id: 'file-1',
        updated_at: now,
        created_at: now,
        metadata: { size: 2450000, mimetype: 'application/pdf' },
        path: `${userId}/`
      },
      {
        name: 'Dashboard_UI_Mockup.png',
        id: 'file-2',
        updated_at: now,
        created_at: now,
        metadata: { size: 4800000, mimetype: 'image/png' },
        path: `${userId}/`
      },
      {
        name: 'Product_Demo_Video.mp4',
        id: 'file-3',
        updated_at: now,
        created_at: now,
        metadata: { size: 28500000, mimetype: 'video/mp4' },
        path: `${userId}/`
      },
      {
        name: 'Quarterly_Report_2026.docx',
        id: 'file-4',
        updated_at: now,
        created_at: now,
        metadata: { size: 1200000, mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        path: `${userId}/`
      },
      {
        name: 'App_Spec.pdf',
        id: 'file-5',
        updated_at: now,
        created_at: now,
        metadata: { size: 850000, mimetype: 'application/pdf' },
        path: `${userId}/Projects/`
      }
    ]
    localStorage.setItem('demo_files', JSON.stringify(initialFiles))
    localStorage.setItem('demo_files_seeded', 'true')
  } catch (e) {
    console.error('Failed to seed demo files:', e)
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  const isConfigured = Boolean(
    url && 
    key && 
    !url.includes('placeholder') && 
    !key.includes('placeholder')
  )

  let realClient = null
  if (isConfigured) {
    try {
      realClient = createBrowserClient(url, key)
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e)
    }
  }

  return {
    auth: {
      getUser: async () => {
        if (realClient) {
          try {
            const res = await realClient.auth.getUser()
            if (res.data?.user) return res
          } catch (e) {
            console.warn('Supabase auth.getUser error:', e)
          }
        }
        let demoUser = getDemoUser()
        if (!demoUser && typeof window !== 'undefined') {
          demoUser = {
            id: 'demo-user-id',
            email: 'demo@nimbusvault.com',
            user_metadata: { full_name: 'Demo User' }
          }
          setDemoUser(demoUser)
        }
        if (demoUser) {
          seedInitialDemoFiles(demoUser.id)
        }
        return { data: { user: demoUser }, error: null }
      },
      getSession: async () => {
        if (realClient) {
          try {
            const res = await realClient.auth.getSession()
            if (res.data?.session) return res
          } catch (e) {
            console.warn('Supabase auth.getSession error:', e)
          }
        }
        const demoUser = getDemoUser()
        return { data: { session: demoUser ? { user: demoUser } : null }, error: null }
      },
      signInWithPassword: async ({ email, password, isDemo }) => {
        if (isDemo) {
          const demoUser = {
            id: 'demo-user-id',
            email: email || 'demo@nimbusvault.com',
            user_metadata: { full_name: email && email.includes('@') ? email.split('@')[0] : 'Demo User' }
          }
          setDemoUser(demoUser)
          seedInitialDemoFiles(demoUser.id)
          return { data: { user: demoUser, session: { user: demoUser } }, error: null }
        }

        if (realClient) {
          try {
            const res = await realClient.auth.signInWithPassword({ email, password })
            if (!res.error && res.data?.user) {
              setDemoUser(res.data.user)
              return res
            }
            if (res.error) {
              return res
            }
          } catch (e) {
            console.warn('Supabase signInWithPassword error:', e)
            return { data: { user: null }, error: { message: e.message || 'Authentication failed' } }
          }
        }

        const demoUser = {
          id: 'demo-user-id',
          email: email || 'demo@nimbusvault.com',
          user_metadata: { full_name: email && email.includes('@') ? email.split('@')[0] : 'Demo User' }
        }
        setDemoUser(demoUser)
        seedInitialDemoFiles(demoUser.id)
        return { data: { user: demoUser, session: { user: demoUser } }, error: null }
      },
      signUp: async ({ email, password, options, isDemo }) => {
        if (isDemo) {
          const demoUser = {
            id: 'demo-user-id',
            email: email || 'demo@nimbusvault.com',
            user_metadata: { full_name: options?.data?.full_name || (email && email.includes('@') ? email.split('@')[0] : 'Demo User') }
          }
          setDemoUser(demoUser)
          seedInitialDemoFiles(demoUser.id)
          return { data: { user: demoUser, session: { user: demoUser } }, error: null }
        }

        if (realClient) {
          try {
            const res = await realClient.auth.signUp({ email, password, options })
            if (!res.error && res.data?.user) {
              setDemoUser(res.data.user)
              return res
            }
            if (res.error) {
              return res
            }
          } catch (e) {
            console.warn('Supabase signUp error:', e)
            return { data: { user: null }, error: { message: e.message || 'Signup failed' } }
          }
        }

        const demoUser = {
          id: 'demo-user-id',
          email: email || 'demo@nimbusvault.com',
          user_metadata: { full_name: options?.data?.full_name || (email && email.includes('@') ? email.split('@')[0] : 'Demo User') }
        }
        setDemoUser(demoUser)
        seedInitialDemoFiles(demoUser.id)
        return { data: { user: demoUser, session: { user: demoUser } }, error: null }
      },
      updateUser: async ({ data }) => {
        if (realClient) {
          try {
            const res = await realClient.auth.updateUser({ data })
            if (!res.error && res.data?.user) {
              setDemoUser(res.data.user)
              return res
            }
          } catch (e) {
            console.warn('Supabase updateUser error:', e)
          }
        }
        const demoUser = getDemoUser() || {}
        const updatedUser = {
          ...demoUser,
          user_metadata: {
            ...demoUser.user_metadata,
            ...data
          }
        }
        setDemoUser(updatedUser)
        return { data: { user: updatedUser }, error: null }
      },
      signOut: async () => {
        setDemoUser(null)
        if (realClient) {
          try {
            await realClient.auth.signOut()
          } catch (e) {
            console.warn('Supabase signOut error:', e)
          }
        }
        return { error: null }
      },
      onAuthStateChange: (callback) => {
        if (realClient) {
          try {
            return realClient.auth.onAuthStateChange(callback)
          } catch {}
        }
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
    storage: {
      from: (bucket) => ({
        list: async (pathString = '', options = {}) => {
          const demoUser = getDemoUser()
          if (realClient && (!demoUser || demoUser.id !== 'demo-user-id')) {
            try {
              const res = await realClient.storage.from(bucket).list(pathString, options)
              if (!res.error && res.data) {
                const demoItems = getDemoFiles(pathString)
                const existingNames = new Set(res.data.map(i => i.name))
                const merged = [...res.data]
                demoItems.forEach(item => {
                  if (!existingNames.has(item.name)) merged.push(item)
                })
                return { data: merged, error: null }
              }
            } catch (e) {
              console.warn('Supabase storage.list error:', e)
            }
          }
          return { data: getDemoFiles(pathString), error: null }
        },
        upload: async (filePath, file, options = {}) => {
          const demoUser = getDemoUser()
          if (realClient && (!demoUser || demoUser.id !== 'demo-user-id')) {
            try {
              const res = await realClient.storage.from(bucket).upload(filePath, file, options)
              if (!res.error) return res
            } catch (e) {
              console.warn('Supabase storage.upload error:', e)
            }
          }
          saveDemoFile(filePath, file)
          return { data: { path: filePath }, error: null }
        },
        download: async (filePath) => {
          if (realClient) {
            try {
              const res = await realClient.storage.from(bucket).download(filePath)
              if (!res.error && res.data) return res
            } catch {}
          }
          const blob = new Blob(["NimbusVault Sample File Content\n\nGenerated for path: " + filePath], { type: "text/plain" })
          return { data: blob, error: null }
        },
        remove: async (paths = []) => {
          const demoUser = getDemoUser()
          if (realClient && (!demoUser || demoUser.id !== 'demo-user-id')) {
            try {
              const res = await realClient.storage.from(bucket).remove(paths)
              if (!res.error) return res
            } catch (e) {
              console.warn('Supabase storage.remove error:', e)
            }
          }
          paths.forEach(p => removeDemoFile(p))
          return { data: [], error: null }
        },
        move: async (fromPath, toPath) => {
          if (realClient) {
            try {
              const res = await realClient.storage.from(bucket).move(fromPath, toPath)
              if (!res.error) return res
            } catch {}
          }
          // Handle demo move
          try {
            const saved = localStorage.getItem('demo_files') || '[]'
            const files = JSON.parse(saved)
            const updated = files.map(f => {
              if (f.path + f.name === fromPath) {
                const parts = toPath.split('/')
                const fileName = parts.pop()
                const folderPath = parts.join('/') + '/'
                return { ...f, path: folderPath, name: fileName }
              }
              return f
            })
            localStorage.setItem('demo_files', JSON.stringify(updated))
          } catch {}
          return { data: null, error: null }
        },
        createSignedUrl: async () => ({ data: null, error: null }),
        getPublicUrl: (filePath) => {
          if (realClient) {
            try {
              return realClient.storage.from(bucket).getPublicUrl(filePath)
            } catch {}
          }
          return { data: { publicUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop' } }
        },
      })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          data: [],
          error: null
        }),
        data: [],
        error: null
      }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
    })
  }
}

