import React from 'react'

import {
    Platform,
    View,
    ViewStyle,
} from 'react-native'

import { BlurView } from 'expo-blur'

type Props = {
  children: React.ReactNode

  style?: ViewStyle | ViewStyle[]

  intensity?: number
}

export default function GlassCard({
  children,
  style,
  intensity = 24,
}: Props) {
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          {
            backgroundColor:
              'rgba(17,17,20,0.94)',

            borderWidth: 1,

            borderColor:
              'rgba(255,255,255,0.08)',

            overflow: 'hidden',
          },

          style,
        ]}
      >
        {children}
      </View>
    )
  }

  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      style={[
        {
          overflow: 'hidden',

          borderWidth: 1,

          borderColor:
            'rgba(255,255,255,0.08)',
        },

        style,
      ]}
    >
      {children}
    </BlurView>
  )
}