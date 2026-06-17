import 'react-native-gesture-handler'
import 'react-native-reanimated'

import { Stack } from 'expo-router'

import { AuthProvider } from '../src/providers/AuthProvider'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    </AuthProvider>
  )
}