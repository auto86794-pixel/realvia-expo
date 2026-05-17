import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'

import { useState } from 'react'

import { router } from 'expo-router'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import * as ImagePicker from 'expo-image-picker'

import { Image } from 'expo-image'

import { decode } from 'base64-arraybuffer'

import { supabase } from '@/src/services/supabase'

import {
  Colors,
  Radius,
  Shadows,
} from '@/constants/theme'

export default function UploadScreen() {
  const [title, setTitle] =
    useState('')

  const [location, setLocation] =
    useState('')

  const [price, setPrice] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [category, setCategory] =
    useState('Lakások')

  const [image, setImage] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(false)

  const categories = [
    'Lakások',
    'Családi ház',
    'Villák',
    'Penthouse',
    'Új építésű',
  ]

  async function pickImage() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,

            allowsEditing: true,

            aspect: [16, 9],

            quality: 0.9,

            base64: true,
          }
        )

      if (result.canceled) return

      const asset =
        result.assets?.[0]

      if (!asset) return

      const fileExt =
        asset.uri
          .split('.')
          .pop() || 'jpg'

      const fileName = `${Date.now()}.${fileExt}`

      const filePath = `${fileName}`

      const { error } =
        await supabase.storage
          .from('properties')
          .upload(
            filePath,
            decode(
              asset.base64 || ''
            ),
            {
              contentType:
                asset.mimeType ||
                'image/jpeg',
            }
          )

      if (error) {
        console.log(error)

        Alert.alert(
          'Hiba',
          'Nem sikerült feltölteni a képet.'
        )

        return
      }

      const { data } =
        supabase.storage
          .from('properties')
          .getPublicUrl(
            filePath
          )

      setImage(data.publicUrl)
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'Kép feltöltési hiba.'
      )
    }
  }

  async function handleUpload() {
    try {
      if (
        !title ||
        !location ||
        !price ||
        !image
      ) {
        Alert.alert(
          'Hiányzó mezők',
          'Tölts ki minden kötelező mezőt.'
        )

        return
      }

      setLoading(true)

      const { error } =
        await supabase
          .from('properties')
          .insert({
            title,
            location,
            price,
            image,
            description,
            category,
            gallery: [image],
          })

      if (error) {
        console.log(error)

        Alert.alert(
          'Hiba',
          'Nem sikerült publikálni az ingatlant.'
        )

        return
      }

      Alert.alert(
        'Sikeres feltöltés',
        'Az ingatlan publikálva lett.'
      )

      router.back()
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'Váratlan hiba történt.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor:
          Colors.dark.background,
      }}
      contentContainerStyle={{
        paddingTop: 90,
        paddingBottom: 160,
        paddingHorizontal: 24,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HEADER */}
      <Animated.View
        entering={FadeInDown.springify()}
      >
        <Text
          style={{
            color: 'white',

            fontSize:
              Platform.OS === 'web'
                ? 54
                : 42,

            fontWeight: '900',

            letterSpacing: -2,
          }}
        >
          Új ingatlan
        </Text>

        <Text
          style={{
            color:
              Colors.dark.muted,

            marginTop: 14,

            fontSize: 17,

            lineHeight: 28,

            maxWidth: 540,
          }}
        >
          Tölts fel prémium
          ingatlant a Realvia
          platformra.
        </Text>
      </Animated.View>

      {/* FORM */}
      <View
        style={{
          marginTop: 42,
          gap: 24,
        }}
      >
        <Input
          label="Ingatlan neve"
          value={title}
          onChangeText={setTitle}
          placeholder="Panorámás luxus villa"
        />

        <Input
          label="Lokáció"
          value={location}
          onChangeText={setLocation}
          placeholder="Budapest II. kerület"
        />

        <Input
          label="Ár"
          value={price}
          onChangeText={setPrice}
          placeholder="249 M Ft"
        />

        <Input
          label="Leírás"
          value={description}
          onChangeText={
            setDescription
          }
          placeholder="Modern prémium ingatlan..."
          multiline
          height={160}
        />

        {/* IMAGE PICKER */}
        <View>
          <Text
            style={{
              color: 'white',

              fontSize: 15,

              fontWeight: '700',

              marginBottom: 14,
            }}
          >
            Borítókép
          </Text>

          <Pressable
            onPress={pickImage}
            style={{
              backgroundColor:
                Colors.dark.surface,

              borderRadius:
                Radius.lg,

              borderWidth: 1,

              borderColor:
                Colors.dark.border,

              overflow: 'hidden',

              alignItems: 'center',

              justifyContent:
                'center',

              height: image
                ? 280
                : 160,

              ...Shadows.luxury,
            }}
          >
            {image ? (
              <Image
                source={{
                  uri: image,
                }}
                contentFit="cover"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            ) : (
              <Text
                style={{
                  color:
                    Colors.dark
                      .primary,

                  fontSize: 16,

                  fontWeight: '800',
                }}
              >
                + Kép kiválasztása
              </Text>
            )}
          </Pressable>
        </View>

        {/* CATEGORY */}
        <View>
          <Text
            style={{
              color: 'white',

              fontSize: 15,

              fontWeight: '700',

              marginBottom: 14,
            }}
          >
            Kategória
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={{
              gap: 12,
            }}
          >
            {categories.map(
              (item) => (
                <Pressable
                  key={item}
                  onPress={() =>
                    setCategory(item)
                  }
                  style={{
                    backgroundColor:
                      category === item
                        ? Colors.dark
                            .primary
                        : Colors.dark
                            .surface,

                    paddingHorizontal: 22,

                    paddingVertical: 14,

                    borderRadius:
                      Radius.full,

                    borderWidth: 1,

                    borderColor:
                      category === item
                        ? Colors.dark
                            .primary
                        : Colors.dark
                            .border,
                  }}
                >
                  <Text
                    style={{
                      color:
                        category === item
                          ? '#000'
                          : 'white',

                      fontWeight: '800',
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>
        </View>

        {/* SUBMIT */}
        <Pressable
          onPress={handleUpload}
          disabled={loading}
          style={{
            backgroundColor:
              Colors.dark.primary,

            paddingVertical: 22,

            borderRadius:
              Radius.full,

            alignItems: 'center',

            marginTop: 14,

            opacity: loading
              ? 0.7
              : 1,

            ...Shadows.luxury,
          }}
        >
          <Text
            style={{
              color: '#000',

              fontSize: 17,

              fontWeight: '900',
            }}
          >
            {loading
              ? 'Feltöltés...'
              : 'Ingatlan publikálása'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  height,
}: any) {
  return (
    <View>
      <Text
        style={{
          color: 'white',

          fontSize: 15,

          fontWeight: '700',

          marginBottom: 12,
        }}
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        placeholder={placeholder}
        placeholderTextColor="#666"
        multiline={multiline}
        style={{
          backgroundColor:
            Colors.dark.surface,

          borderRadius:
            Radius.lg,

          paddingHorizontal: 20,

          paddingVertical: 18,

          color: 'white',

          fontSize: 16,

          borderWidth: 1,

          borderColor:
            Colors.dark.border,

          minHeight:
            height || 64,

          textAlignVertical:
            multiline
              ? 'top'
              : 'center',
        }}
      />
    </View>
  )
}