import React from 'react'

import {
    Pressable,
    Text,
    View,
} from 'react-native'

import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import { MapPin } from 'lucide-react-native'

const MAP_PREVIEW_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop'

interface Props {
  neighborhood?: string
  location: string
  onOpenMap: () => void
}

export default function PropertyLocation({
  neighborhood,
  location,
  onOpenMap,
}: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 36,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 20,
        }}
      >
        <View>
          <Text
            style={{
              color: 'white',
              fontSize: 30,
              fontWeight: '800',
            }}
          >
            Környék
          </Text>

          <Text
            style={{
              color: '#8F8F95',
              marginTop: 6,
              fontSize: 15,
            }}
          >
            Lifestyle, lokáció és prémium környezet
          </Text>
        </View>

        <Pressable
          onPress={onOpenMap}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 999,
            backgroundColor:
              'rgba(214,176,123,0.13)',
          }}
        >
          <Text
            style={{
              color: '#D6B07B',
              fontWeight: '800',
              fontSize: 13,
            }}
          >
            Térkép
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onOpenMap}
        style={{
          backgroundColor:
            'rgba(255,255,255,0.04)',
          borderRadius: 30,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor:
            'rgba(255,255,255,0.08)',
        }}
      >
        <Image
          source={{
            uri: MAP_PREVIEW_IMAGE,
          }}
          contentFit="cover"
          style={{
            width: '100%',
            height: 250,
          }}
        />

        <LinearGradient
          colors={[
            'transparent',
            'rgba(0,0,0,0.9)',
          ]}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 24,
          }}
        >
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: '#D6B07B',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <MapPin
              size={25}
              color="#000"
            />
          </View>

          <Text
            style={{
              color: 'white',
              fontSize: 24,
              fontWeight: '800',
            }}
          >
            {neighborhood || location}
          </Text>

          <Text
            style={{
              color: '#CFCFD4',
              marginTop: 10,
              lineHeight: 26,
              fontSize: 15,
            }}
          >
            Exkluzív éttermek, prémium üzletek, nyugodt utcák és privát lifestyle élmény néhány perc távolságra.
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  )
}