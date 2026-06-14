import React from 'react'

import {
    Pressable,
    ScrollView,
    View,
} from 'react-native'

import { Image } from 'expo-image'

interface Props {
  images: string[]
  currentImage: number
  onSelectImage: (
    index: number
  ) => void
}

export default function PropertyGallery({
  images,
  currentImage,
  onSelectImage,
}: Props) {
  return (
    <View
      style={{
        paddingTop: 28,
        paddingLeft: 24,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 14,
          paddingRight: 24,
        }}
      >
        {images.map(
          (image, index) => (
            <Pressable
              key={index}
              onPress={() =>
                onSelectImage(index)
              }
              style={{
                width: 110,
                height: 84,
                borderRadius: 22,
                overflow: 'hidden',
                borderWidth:
                  currentImage === index
                    ? 2
                    : 1,
                borderColor:
                  currentImage === index
                    ? '#E7C48B'
                    : 'rgba(255,255,255,0.08)',
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
            </Pressable>
          )
        )}
      </ScrollView>
    </View>
  )
}