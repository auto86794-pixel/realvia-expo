import { useEffect } from 'react'

import { router } from 'expo-router'

import { useAuth } from '../providers/AuthProvider'

export function useProtectedRoute() {
  const { session, loading } =
    useAuth()

  useEffect(() => {
    // Megvárjuk amíg a session betölt
    if (loading) return

    // Ha nincs login → welcome
    if (!session) {
      router.replace('/welcome')
    }
  }, [session, loading])
}