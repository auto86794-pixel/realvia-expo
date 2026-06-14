import { View } from 'react-native'

import { useEffect } from 'react'

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

export default function PropertyCardSkeleton() {
  const opacity =
    useSharedValue(0.35)

  const translateX =
    useSharedValue(-300)

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

    translateX.value =
      withRepeat(
        withTiming(500, {
          duration: 1800,
          easing: Easing.linear,
        }),
        -1,
        false
      )
  }, [])

  const animatedStyle =
    useAnimatedStyle(() => ({
      opacity: opacity.value,
    }))

  const shimmerStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          translateX:
            translateX.value,
        },
        {
          rotate: '12deg',
        },
      ],
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

      {/* SHIMMER */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',

            width: 180,
            height: '140%',

            backgroundColor:
              'rgba(255,255,255,0.05)',

            opacity: 0.18,

            top: -80,
          },

          shimmerStyle,
        ]}
      />
    </Animated.View>
  )
}