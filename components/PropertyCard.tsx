import {
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native'

import { router } from 'expo-router'

import { LinearGradient } from 'expo-linear-gradient'

import { Image } from 'expo-image'

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import {
  Colors,
  Radius,
  Shadows,
} from '@/constants/theme'

import { hu } from '@/constants/translations'

type Props = {
  id: string | number

  title: string

  price: string

  location: string

  images: string[]
}

const AnimatedPressable =
  Animated.createAnimatedComponent(
    Pressable
  )

export default function PropertyCard({
  id,
  title,
  price,
  location,
  images,
}: Props) {
  const propertyId = String(id)

  const scale = useSharedValue(1)

  const imageScale =
    useSharedValue(1)

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: scale.value,
        },
      ],
    }))

  const imageAnimatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale:
            imageScale.value,
        },
      ],
    }))

  return (
    <AnimatedPressable
      onPress={() =>
        router.push({
          pathname:
            '/property/[id]',
          params: {
            id: propertyId,
          },
        })
      }
      onHoverIn={() => {
        if (Platform.OS === 'web') {
          scale.value =
            withSpring(1.02)

          imageScale.value =
            withSpring(1.06)
        }
      }}
      onHoverOut={() => {
        scale.value =
          withSpring(1)

        imageScale.value =
          withSpring(1)
      }}
      style={[
        {
          height:
            Platform.OS ===
            'web'
              ? 520
              : 430,

          borderRadius:
            Radius.xl,

          overflow: 'hidden',

          backgroundColor:
            Colors.dark.surface,

          borderWidth: 1,

          borderColor:
            Colors.dark.border,

          ...Shadows.luxury,
        },

        animatedStyle,
      ]}
    >
      {/* IMAGE */}
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
          },

          imageAnimatedStyle,
        ]}
      >
        <Image
          source={{
            uri:
              images?.[0] ||
              'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop',
          }}
          contentFit="cover"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Animated.View>

      {/* DARK OVERLAY */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(0,0,0,0.15)',
          'rgba(0,0,0,0.82)',
        ]}
        style={{
          position: 'absolute',

          width: '100%',
          height: '100%',

          justifyContent:
            'flex-end',
        }}
      />

      {/* TOP BADGE */}
      <View
        style={{
          position: 'absolute',

          top: 22,
          left: 22,

          backgroundColor:
            'rgba(255,255,255,0.14)',

          borderRadius: 999,

          paddingHorizontal: 16,

          paddingVertical: 10,

          borderWidth: 1,

          borderColor:
            'rgba(255,255,255,0.18)',
        }}
      >
        <Text
          style={{
            color: 'white',

            fontSize: 12,

            fontWeight: '700',

            letterSpacing: 1.2,

            textTransform:
              'uppercase',
          }}
        >
          Luxus Ingatlan
        </Text>
      </View>

      {/* CONTENT */}
      <View
        style={{
          position: 'absolute',

          left: 0,
          right: 0,
          bottom: 0,

          padding: 28,
        }}
      >
        {/* LOCATION */}
        <Text
          style={{
            color:
              'rgba(255,255,255,0.70)',

            fontSize: 13,

            letterSpacing: 1.8,

            textTransform:
              'uppercase',

            marginBottom: 10,

            fontWeight: '600',
          }}
        >
          📍 {location}
        </Text>

        {/* TITLE */}
        <Text
          style={{
            color: 'white',

            fontSize:
              Platform.OS ===
              'web'
                ? 38
                : 32,

            lineHeight:
              Platform.OS ===
              'web'
                ? 42
                : 36,

            letterSpacing: -1.8,

            maxWidth: '88%',

            fontWeight: '800',
          }}
        >
          {title}
        </Text>

        {/* PRICE */}
        <View
          style={{
            marginTop: 18,

            flexDirection: 'row',

            alignItems: 'center',

            justifyContent:
              'space-between',
          }}
        >
          <Text
            style={{
              color:
                Colors.dark.primary,

              fontSize: 30,

              fontWeight: '700',

              letterSpacing: -1,
            }}
          >
            {price}
          </Text>

          <View
            style={{
              backgroundColor:
                'rgba(255,255,255,0.10)',

              paddingHorizontal: 18,

              paddingVertical: 12,

              borderRadius: 999,

              borderWidth: 1,

              borderColor:
                'rgba(255,255,255,0.12)',
            }}
          >
            <Text
              style={{
                color: 'white',

                fontSize: 13,

                fontWeight: '700',
              }}
            >
              {hu.property.view}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  )
}