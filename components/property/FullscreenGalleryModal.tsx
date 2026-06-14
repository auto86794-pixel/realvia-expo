import React from 'react'

import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'

import { Image } from 'expo-image'

const screenWidth =
  Dimensions.get('window').width

const screenHeight =
  Dimensions.get('window').height

interface Props {
  visible: boolean
  images: string[]
  currentImage: number
  onClose: () => void
  onSelectImage: (
    index: number
  ) => void
}

export default function FullscreenGalleryModal({
  visible,
  images,
  currentImage,
  onClose,
  onSelectImage,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: '#000',
        }}
      >
        <Image
          source={{
            uri: images[currentImage],
          }}
          contentFit="contain"
          style={{
            width: screenWidth,
            height: screenHeight,
          }}
        />

        {/* CLOSE */}

        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 60,
            right: 24,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor:
              'rgba(255,255,255,0.12)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 22,
              fontWeight: '700',
            }}
          >
            ✕
          </Text>
        </Pressable>

        {/* COUNTER */}

        <View
          style={{
            position: 'absolute',
            top: 64,
            left: 24,
            backgroundColor:
              'rgba(255,255,255,0.12)',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: '700',
            }}
          >
            {currentImage + 1} /{' '}
            {images.length}
          </Text>
        </View>

        {/* THUMBNAILS */}

        <View
          style={{
            position: 'absolute',
            bottom: 50,
            left: 0,
            right: 0,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={{
              paddingHorizontal: 24,
              gap: 12,
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
                    width: 82,
                    height: 82,
                    borderRadius: 20,
                    overflow: 'hidden',
                    borderWidth:
                      currentImage === index
                        ? 2
                        : 1,
                    borderColor:
                      currentImage === index
                        ? '#D6B07B'
                        : 'rgba(255,255,255,0.2)',
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
      </View>
    </Modal>
  )
}