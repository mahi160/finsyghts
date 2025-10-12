import { useEffect, useMemo, useState } from 'react'
// import {
//   startBackgroundSync,
//   stopBackgroundSync,
//   syncTables,
// } from '../sync/syncManager'
import { supabase } from './client'
import { AuthContext } from './useAuth'
import type { User } from '@supabase/supabase-js'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let hasSynced = false

    const handleAuth = async (sessionUser: User | null) => {
      setUser(sessionUser)
      setLoading(false)
      if (sessionUser && !hasSynced) {
        hasSynced = true
        // await syncTables()
        // startBackgroundSync()
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuth(session?.user ?? null)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuth(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
      // stopBackgroundSync()
    }
  }, [])

  const value = useMemo(() => ({ user, loading }), [user, loading])

  return <AuthContext value={value}>{children}</AuthContext>
}
