import 'react-native-gesture-handler'
import 'react-native-reanimated'

import { Stack } from 'expo-router'
import { View } from 'react-native'

import { AuthProvider } from '../src/providers/AuthProvider'
import { Colors } from '../constants/theme'

export default function RootLayout() {
  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        minHeight: '100%',
        backgroundColor: Colors.dark.background,
      }}
    >
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: {
              backgroundColor: Colors.dark.background,
            },
          }}
        />
      </AuthProvider>
    </View>
  )
}
