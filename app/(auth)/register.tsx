import { useState } from 'react'
import {
    Alert,
    Button,
    TextInput,
    View,
} from 'react-native'

import { supabase } from '../../src/services/supabase'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleRegister() {
    console.log('REGISTER BUTTON PRESSED')

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      })

    console.log('SUPABASE DATA:', data)
    console.log('SUPABASE ERROR:', error)

    if (error) {
      Alert.alert(error.message)
      return
    }

    Alert.alert('SUCCESS')
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 12,
      }}
    >
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
        }}
      />

      <Button
        title="Register"
        onPress={handleRegister}
      />
    </View>
  )
}