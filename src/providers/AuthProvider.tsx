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
}

const AuthContext =
  createContext<AuthContextType>({
    session: null,
    loading: true,
    refreshSession: async () => null,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext)
