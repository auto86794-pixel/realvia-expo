import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'

import {
  useEffect,
  useState,
} from 'react'

import {
  router,
  useLocalSearchParams,
} from 'expo-router'

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

export default function EditProperty() {
  const { id } =
    useLocalSearchParams()

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

  const [images, setImages] =
    useState<string[]>([])

  const [loading, setLoading] =
    useState(false)

  const [
    initialLoading,
    setInitialLoading,
  ] = useState(true)

  const categories = [
    'Lakások',
    'Családi ház',
    'Villák',
    'Penthouse',
    'Új építésű',
  ]

  async function loadProperty() {
    try {
      const { data, error } =
        await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single()

      if (error) {
        console.log(error)
        return
      }

      if (data) {
        setTitle(data.title || '')

        setLocation(
          data.location || ''
        )

        setPrice(data.price || '')

        setDescription(
          data.description || ''
        )

        setCategory(
          data.category ||
            'Lakások'
        )

        setImages(
          data.gallery ||
            (data.image
              ? [data.image]
              : [])
        )
      }
    } catch (error) {
      console.log(error)
    } finally {
      setInitialLoading(false)
    }
  }

  async function pickImage() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,

            allowsMultipleSelection: true,

            selectionLimit: 10,

            quality: 0.9,

            base64: true,
          }
        )

      if (result.canceled) return

      const uploadedImages: string[] =
        []

      for (const asset of result.assets) {
        const fileExt =
          asset.uri
            .split('.')
            .pop() || 'jpg'

        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`

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
          continue
        }

        const { data } =
          supabase.storage
            .from('properties')
            .getPublicUrl(
              filePath
            )

        uploadedImages.push(
          data.publicUrl
        )
      }

      setImages((prev) => [
        ...prev,
        ...uploadedImages,
      ])
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'Kép feltöltési hiba.'
      )
    }
  }

  function removeImage(
    imageToRemove: string
  ) {
    setImages((prev) =>
      prev.filter(
        (img) =>
          img !== imageToRemove
      )
    )
  }

  async function handleUpdate() {
    try {
      setLoading(true)

      const { error } =
        await supabase
          .from('properties')
          .update({
            title,
            location,
            price,
            description,
            category,
            image: images[0],
            gallery: images,
          })
          .eq('id', id)

      if (error) {
        console.log(error)

        Alert.alert(
          'Hiba',
          'Nem sikerült frissíteni.'
        )

        return
      }

      Alert.alert(
        'Sikeres mentés',
        'Az ingatlan frissítve lett.'
      )

      router.back()
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      Alert.alert(
        'Ingatlan törlése',
        'Biztosan törölni szeretnéd ezt az ingatlant?',
        [
          {
            text: 'Mégse',
            style: 'cancel',
          },
          {
            text: 'Törlés',
            style: 'destructive',

            onPress: async () => {
              const { error } =
                await supabase
                  .from(
                    'properties'
                  )
                  .delete()
                  .eq('id', id)

              if (error) {
                console.log(error)

                Alert.alert(
                  'Hiba',
                  'Nem sikerült törölni.'
                )

                return
              }

              Alert.alert(
                'Sikeres törlés',
                'Az ingatlan törölve lett.'
              )

              router.replace(
                '/dashboard'
              )
            },
          },
        ]
      )
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    loadProperty()
  }, [])

  if (initialLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            Colors.dark
              .background,
        }}
      />
    )
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
        paddingBottom: 180,
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
              Platform.OS ===
              'web'
                ? 54
                : 42,

            fontWeight: '900',

            letterSpacing: -2,
          }}
        >
          Ingatlan szerkesztése
        </Text>

        <Text
          style={{
            color:
              Colors.dark.muted,

            marginTop: 12,

            fontSize: 17,

            lineHeight: 28,
          }}
        >
          Frissítsd az ingatlan
          adatait és galériáját.
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
        />

        <Input
          label="Lokáció"
          value={location}
          onChangeText={setLocation}
        />

        <Input
          label="Ár"
          value={price}
          onChangeText={setPrice}
        />

        <Input
          label="Leírás"
          value={description}
          onChangeText={
            setDescription
          }
          multiline
          height={160}
        />

        {/* GALLERY */}
        <View>
          <Text
            style={{
              color: 'white',

              fontSize: 15,

              fontWeight: '700',

              marginBottom: 14,
            }}
          >
            Galéria
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={{
              gap: 14,
            }}
          >
            {images.map((img) => (
              <View
                key={img}
                style={{
                  position:
                    'relative',
                }}
              >
                <Image
                  source={{
                    uri: img,
                  }}
                  contentFit="cover"
                  style={{
                    width: 220,
                    height: 140,

                    borderRadius:
                      20,
                  }}
                />

                <Pressable
                  onPress={() =>
                    removeImage(
                      img
                    )
                  }
                  style={{
                    position:
                      'absolute',

                    top: 10,
                    right: 10,

                    backgroundColor:
                      'rgba(0,0,0,0.7)',

                    width: 34,
                    height: 34,

                    borderRadius:
                      999,

                    alignItems:
                      'center',

                    justifyContent:
                      'center',
                  }}
                >
                  <Text
                    style={{
                      color:
                        'white',

                      fontSize: 18,

                      fontWeight:
                        '900',
                    }}
                  >
                    ×
                  </Text>
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={pickImage}
              style={{
                width: 220,
                height: 140,

                borderRadius: 20,

                backgroundColor:
                  Colors.dark
                    .surface,

                borderWidth: 1,

                borderColor:
                  Colors.dark
                    .border,

                alignItems:
                  'center',

                justifyContent:
                  'center',

                ...Shadows.luxury,
              }}
            >
              <Text
                style={{
                  color:
                    Colors.dark
                      .primary,

                  fontWeight: '800',

                  fontSize: 16,
                }}
              >
                + Képek hozzáadása
              </Text>
            </Pressable>
          </ScrollView>
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

        {/* SAVE BUTTON */}
        <Pressable
          onPress={handleUpdate}
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
              ? 'Mentés...'
              : 'Változtatások mentése'}
          </Text>
        </Pressable>

        {/* DELETE BUTTON */}
        <Pressable
          onPress={handleDelete}
          style={{
            backgroundColor:
              'rgba(255,80,80,0.12)',

            paddingVertical: 22,

            borderRadius:
              Radius.full,

            alignItems: 'center',

            borderWidth: 1,

            borderColor:
              'rgba(255,80,80,0.18)',
          }}
        >
          <Text
            style={{
              color: '#FF6B6B',

              fontSize: 17,

              fontWeight: '900',
            }}
          >
            🗑️ Ingatlan törlése
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
        multiline={multiline}
        placeholderTextColor="#666"
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