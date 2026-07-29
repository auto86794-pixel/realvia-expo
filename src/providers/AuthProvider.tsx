import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../services/supabase'

type AuthContextType = {
  session: any | null
  loading: boolean
  refreshSession: () => Promise<any | null>
  signOut: () => Promise<void>
}

const AuthContext =
  createContext<AuthContextType>({
    session: null,
    loading: true,
    refreshSession: async () => null,
    signOut: async () => {},
  })

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] =
    useState<any | null>(null)

  const [loading, setLoading] =
    useState(true)

  const refreshSession =
    useCallback(async () => {
      const { data, error } =
        await supabase.auth.getSession({
          forceFetch: true,
        })

      if (error) {
        throw error
      }

      const nextSession =
        data?.session || null

      setSession(nextSession)

      return nextSession
    }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // A Neon Auth eseménye böngészőtől függően késhet. A helyi állapotot
    // azonnal töröljük, hogy a vendég nézet soha ne örökölje a tulajdonost.
    setSession(null)
  }, [])

  useEffect(() => {
    async function loadSession() {
      try {
        await refreshSession()
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session)
        }
      )

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshSession])

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        refreshSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext)
