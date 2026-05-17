import { View } from 'react-native'

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import {
  useEffect,
} from 'react'

export default function PropertyCardSkeleton() {
  const opacity =
    useSharedValue(0.35)

  useEffect(() => {
    opacity.value =
      withRepeat(
        withTiming(1, {
          duration: 900,
          easing: Easing.inOut(
            Easing.ease
          ),
        }),
        -1,
        true
      )
  }, [])

  const animatedStyle =
    useAnimatedStyle(() => ({
      opacity: opacity.value,
    }))

  return (
    <Animated.View
      style={[
        {
          height: 430,

          borderRadius: 34,

          backgroundColor:
            '#17171C',

          marginBottom: 22,

          overflow: 'hidden',

          borderWidth: 1,

          borderColor:
            'rgba(255,255,255,0.04)',
        },
        animatedStyle,
      ]}
    >
      {/* IMAGE */}
      <View
        style={{
          flex: 1,

          backgroundColor:
            '#202028',
        }}
      />

      {/* CONTENT */}
      <View
        style={{
          position: 'absolute',

          left: 24,
          right: 24,
          bottom: 24,
        }}
      >
        {/* LOCATION */}
        <View
          style={{
            width: 90,
            height: 12,

            borderRadius: 999,

            backgroundColor:
              '#2B2B35',

            marginBottom: 14,
          }}
        />

        {/* TITLE */}
        <View
          style={{
            width: '72%',
            height: 36,

            borderRadius: 10,

            backgroundColor:
              '#343441',

            marginBottom: 14,
          }}
        />

        {/* PRICE */}
        <View
          style={{
            width: 140,
            height: 28,

            borderRadius: 10,

            backgroundColor:
              '#40404F',
          }}
        />
      </View>
    </Animated.View>
  )
}