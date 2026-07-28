import { useState } from 'react'
import { router } from 'expo-router'

import AuthScreen from '@/components/auth/AuthScreen'
import { supabase } from '@/src/services/supabase'
import { useAuth } from '@/src/providers/AuthProvider'

export default function RegisterScreen() {
  const { refreshSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister() {
    setMessage('')
    setSuccess(false)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage('Adj meg egy valós email címet.')
      return
    }
    if (password.length < 8) {
      setMessage('A jelszónak legalább 8 karakterből kell állnia.')
      return
    }
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
      if (error) {
        setMessage(error.message)
        return
      }
      if (data.user && data.user.identities?.length === 0) {
        setMessage('Ehhez az email címhez már tartozik fiók. Próbálj meg belépni.')
        return
      }
      if (data.session) {
        await refreshSession()
        router.replace('/(tabs)' as any)
        return
      }
      setSuccess(true)
      setMessage('Sikeres regisztráció! Ellenőrizd az emailedet, majd jelentkezz be.')
    } catch (error) {
      console.log(error)
      setMessage('Váratlan hiba történt. Ellenőrizd az internetkapcsolatot.')
    } finally {
      setLoading(false)
    }
  }

  return <AuthScreen mode="register" email={email} password={password} onEmailChange={setEmail} onPasswordChange={setPassword} onSubmit={handleRegister} onSwitch={() => router.push('/login')} loading={loading} message={message} success={success} />
}
