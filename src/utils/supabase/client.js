import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isConfigured = Boolean(
    url && 
    key && 
    !url.includes('placeholder') && 
    !key.includes('placeholder')
  )

  if (!isConfigured) {
    const missingMsg = 'Supabase URL & Anon Key are missing or unconfigured. Please update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({
          data: null,
          error: { message: missingMsg }
        }),
        signUp: async () => ({
          data: null,
          error: { message: missingMsg }
        }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      storage: {
        from: () => ({
          list: async () => ({ data: [], error: null }),
          upload: async () => ({ data: null, error: { message: missingMsg } }),
          remove: async () => ({ data: null, error: { message: missingMsg } }),
          createSignedUrl: async () => ({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
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
        insert: async () => ({ data: null, error: { message: missingMsg } }),
        update: async () => ({ data: null, error: { message: missingMsg } }),
        delete: async () => ({ data: null, error: { message: missingMsg } }),
      })
    }
  }

  return createBrowserClient(url, key)
}
