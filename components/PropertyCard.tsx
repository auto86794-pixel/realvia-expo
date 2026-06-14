import {
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native'

import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'

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
  Animated.createAnimatedComponent(Pressable)

export default function PropertyCard({
  id,
  title,
  price,
  location,
  images,
}: Props) {
  const propertyId = String(id)

  const scale = useSharedValue(1)
  const imageScale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }))

  const formattedPrice = (() => {
    const value = Number(price)

    if (isNaN(value)) {
      return price
    }

    if (value >= 1000000) {
      return `${(value / 1000000)
        .toFixed(1)
        .replace('.', ',')} M Ft`
    }

    return `${value.toLocaleString('hu-HU')} Ft`
  })()

  return (
    <AnimatedPressable
      onPress={() =>
        router.push({
          pathname: '/property/[id]',
          params: { id: propertyId },
        })
      }
      onPressIn={() => {
        scale.value = withSpring(0.985, {
          damping: 16,
          stiffness: 220,
        })

        imageScale.value = withSpring(1.035, {
          damping: 18,
          stiffness: 180,
        })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 16,
          stiffness: 220,
        })

        imageScale.value = withSpring(1, {
          damping: 18,
          stiffness: 180,
        })
      }}
      onHoverIn={() => {
        if (Platform.OS === 'web') {
          scale.value = withSpring(1.02)
          imageScale.value = withSpring(1.06)
        }
      }}
      onHoverOut={() => {
        scale.value = withSpring(1)
        imageScale.value = withSpring(1)
      }}
      style={[
        {
          height: Platform.OS === 'web' ? 500 : 430,
          borderRadius: Radius.xl,
          overflow: 'hidden',
          backgroundColor: Colors.dark.surface,
          borderWidth: 1,
          borderColor: Colors.dark.border,
          ...Shadows.luxury,
        },
        animatedStyle,
      ]}
    >
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
          source={
            images?.[0]
              ? { uri: images[0] }
              : require('../assets/images/luxury-placeholder.png')
          }
          transition={400}
          cachePolicy="memory-disk"
          contentFit="cover"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Animated.View>

      <LinearGradient
        colors={[
          'transparent',
          'rgba(0,0,0,0.12)',
          'rgba(0,0,0,0.72)',
        ]}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          justifyContent: 'flex-end',
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: 22,
          left: 22,
          backgroundColor: 'rgba(230,201,152,0.14)',
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: 'rgba(230,201,152,0.22)',
        }}
      >
        <Text
          style={{
            color: '#F2E6CF',
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1.4,
            textTransform: 'uppercase',
          }}
        >
          REALVIA EXCLUSIVE
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 28,
        }}
      >
        <Text
          style={{
            color: 'rgba(255,255,255,0.70)',
            fontSize: 13,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            marginBottom: 10,
            fontWeight: '600',
          }}
        >
          {location}
        </Text>

        <Text
          style={{
            color: 'white',
            fontSize: Platform.OS === 'web' ? 38 : 32,
            lineHeight: Platform.OS === 'web' ? 42 : 36,
            letterSpacing: -1.2,
            maxWidth: '88%',
            fontWeight: '700',
          }}
        >
          {title}
        </Text>

        <View
          style={{
            marginTop: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              color: Colors.dark.primary,
              fontSize: Platform.OS === 'web' ? 34 : 30,
              fontWeight: '700',
              letterSpacing: -1,
            }}
          >
            {formattedPrice}
          </Text>

          <View
            style={{
              backgroundColor: 'rgba(230,201,152,0.14)',
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: 'rgba(230,201,152,0.18)',
            }}
          >
            <Text
              style={{
                color: '#F2E6CF',
                fontSize: 13,
                fontWeight: '700',
                letterSpacing: 0.5,
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