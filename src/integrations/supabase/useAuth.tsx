import { createContext, use } from 'react'
import type { User } from '@supabase/supabase-js'

export const AuthContext = createContext<{
  user: User | null
  loading: boolean
}>({
  user: null,
  loading: true,
})

export const useAuth = () => use(AuthContext)
