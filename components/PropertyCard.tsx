import {
  ImageBackground,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native'

import { router } from 'expo-router'

import { LinearGradient } from 'expo-linear-gradient'

type Props = {
  id: string | number

  title: string

  price: string

  location: string

  images: string[]
}

export default function PropertyCard({
  id,
  title,
  price,
  location,
  images,
}: Props) {
  const propertyId = String(id)

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/property/${propertyId}`
        )
      }
      style={{
        height: 430,

        borderRadius: 34,

        overflow: 'hidden',

        justifyContent: 'flex-end',

        marginBottom: 22,

        backgroundColor: '#111827',

        borderWidth: 1,

        borderColor:
          'rgba(255,255,255,0.04)',
      }}
    >
      <ImageBackground
        source={{
          uri:
            images?.[0] ||
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop',
        }}
        style={{
          width: '100%',
          height: '100%',

          justifyContent: 'flex-end',
        }}
        imageStyle={{
          borderRadius: 34,
        }}
        resizeMode="cover"
      >
        {/* OVERLAY */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0,0,0,0.72)',
          ]}
          style={{
            position: 'absolute',

            left: 0,
            right: 0,
            bottom: 0,

            paddingTop: 140,

            paddingHorizontal: 24,

            paddingBottom: 24,
          }}
        />

        {/* CONTENT */}
        <View
          style={{
            paddingHorizontal: 24,

            paddingBottom: 24,
          }}
        >
          {/* LOCATION */}
          <Text
            style={{
              color:
                'rgba(255,255,255,0.70)',

              fontSize: 13,

              letterSpacing: 1.5,

              textTransform:
                'uppercase',

              marginBottom: 8,

              fontWeight: '500',

              fontFamily:
                Platform.OS ===
                'web'
                  ? 'Inter, Helvetica, sans-serif'
                  : undefined,
            }}
          >
            {location}
          </Text>

          {/* TITLE */}
          <Text
            style={{
              color: 'white',

              fontSize: 34,

              lineHeight: 38,

              letterSpacing: -1.2,

              maxWidth: '85%',

              fontWeight: '600',

              fontFamily:
                Platform.OS ===
                'web'
                  ? 'Inter, Helvetica, sans-serif'
                  : undefined,
            }}
          >
            {title}
          </Text>

          {/* PRICE */}
          <Text
            style={{
              color: '#E7C48B',

              fontSize: 26,

              fontWeight: '500',

              marginTop: 10,

              letterSpacing: -0.2,

              opacity: 0.95,

              fontFamily:
                Platform.OS ===
                'web'
                  ? 'Inter, Helvetica, sans-serif'
                  : undefined,
            }}
          >
            {price}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  )
}