import { useState } from 'react'
import { Alert } from 'react-native'
import { router } from 'expo-router'

import AuthScreen from '@/components/auth/AuthScreen'
import { supabase } from '@/src/services/supabase'
import { useAuth } from '@/src/providers/AuthProvider'

export default function LoginScreen() {
  const { refreshSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleLogin() {
    setMessage('')
    if (!email.trim() || !password) {
      setMessage('Add meg az email címed és a jelszavad.')
      return
    }
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setMessage('Sikertelen belépés. Ellenőrizd az email címet és a jelszót.')
        return
      }
      const activeSession = await refreshSession()
      if (!activeSession?.user) {
        setMessage('A munkamenet nem indult el. Frissítsd az oldalt, majd próbáld újra.')
        return
      }
      router.replace('/(tabs)' as any)
    } catch (error) {
      console.log(error)
      setMessage('Váratlan hiba történt. Ellenőrizd az internetkapcsolatot.')
      Alert.alert('Hiba', 'A belépés most nem sikerült.')
    } finally {
      setLoading(false)
    }
  }

  return <AuthScreen mode="login" email={email} password={password} onEmailChange={setEmail} onPasswordChange={setPassword} onSubmit={handleLogin} onSwitch={() => router.push('/register')} loading={loading} message={message} />
}
