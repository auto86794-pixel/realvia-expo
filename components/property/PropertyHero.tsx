import React from 'react'

import {
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native'

import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import {
  Heart,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react-native'

const screenWidth =
  Dimensions.get('window').width

const HERO_HEIGHT =
  screenWidth > 900 ? 720 : 620

interface Props {
  property: any
  image: string
  isFavorite: boolean
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onFavorite: () => void
}

export default function PropertyHero({
  property,
  image,
  isFavorite,
  onBack,
  onEdit,
  onDelete,
  onFavorite,
}: Props) {
  const formattedPrice = (() => {
    const value = Number(property.price)

    if (isNaN(value)) {
      return property.price
    }

    return `${(value / 1000000)
      .toFixed(1)
      .replace('.', ',')} M Ft`
  })()

  return (
    <View
      style={{
        height: HERO_HEIGHT,
        overflow: 'hidden',
      }}
    >
      <Image
        source={{ uri: image }}
        contentFit="cover"
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      <LinearGradient
        colors={[
          'rgba(0,0,0,0.55)',
          'transparent',
        ]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: 40,
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
      >
        <BlurView
          intensity={60}
          tint="dark"
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            overflow: 'hidden',
            backgroundColor:
              'rgba(15,15,15,0.42)',
          }}
        >
          <Pressable
            onPress={onBack}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 22,
              }}
            >
              ←
            </Text>
          </Pressable>
        </BlurView>
      </LinearGradient>

      <View
        style={{
          position: 'absolute',
          top: 40,
          right: 24,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <Pressable onPress={onEdit}>
          <Pencil
            size={24}
            color="#D6B07B"
          />
        </Pressable>

        <Pressable onPress={onDelete}>
          <Trash2
            size={24}
            color="#FF6B6B"
          />
        </Pressable>

        <Pressable onPress={onFavorite}>
          <Heart
            size={24}
            color={
              isFavorite
                ? '#FF4D6D'
                : 'white'
            }
            fill={
              isFavorite
                ? '#FF4D6D'
                : 'transparent'
            }
          />
        </Pressable>
      </View>

      <LinearGradient
        colors={[
          'transparent',
          'rgba(0,0,0,0.86)',
        ]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 26,
          paddingBottom: 56,
          paddingTop: 160,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Star
            size={14}
            color="#F3D19C"
            fill="#F3D19C"
          />

          <Text
            style={{
              color:
                'rgba(255,255,255,0.62)',
              fontSize: 13,
              fontWeight: '600',
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            Luxury Residence
          </Text>
        </View>

        <Text
          style={{
            color: 'white',
            fontSize: 42,
            fontWeight: '800',
          }}
        >
          {property.title}
        </Text>

        <Text
          style={{
            color: '#CFCFD4',
            fontSize: 17,
            marginTop: 12,
          }}
        >
          📍 {property.location}
        </Text>

        <Text
          style={{
            color: '#F3D19C',
            fontSize: 36,
            fontWeight: '200',
            marginTop: 18,
          }}
        >
          {formattedPrice}
        </Text>
      </LinearGradient>
    </View>
  )
}