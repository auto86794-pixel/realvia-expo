import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'

import { useState } from 'react'

import {
  router,
} from 'expo-router'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import { supabase } from '@/src/services/supabase'

export default function UploadScreen() {
  const [title, setTitle] =
    useState('')

  const [location, setLocation] =
    useState('')

  const [price, setPrice] =
    useState('')

  const [image, setImage] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [category, setCategory] =
    useState('Villa')

  const [loading, setLoading] =
    useState(false)

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
          'Nem sikerült feltölteni az ingatlant.'
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

  const categories = [
    'Lakások',
  'Családi ház',
  'Villák',
  'Penthouse',
  'Új építésű',
  ]

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#05060A',
      }}
      contentContainerStyle={{
        paddingTop: 90,
        paddingBottom: 140,
        paddingHorizontal: 24,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      <Animated.View
        entering={FadeInDown.springify()}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 42,
            fontWeight: '800',
            letterSpacing: -2,
          }}
        >
          Új ingatlan
        </Text>

        <Text
          style={{
            color: '#8A8A93',
            marginTop: 10,
            fontSize: 16,
            lineHeight: 24,
          }}
        >
          Tölts fel prémium ingatlant
          a Realvia platformra.
        </Text>
      </Animated.View>

      {/* FORM */}
      <View
        style={{
          marginTop: 42,
          gap: 22,
        }}
      >
        <Input
          label="Ingatlan neve"
          value={title}
          onChangeText={setTitle}
          placeholder="Luxus villa panorámával"
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
          placeholder="245 M Ft"
        />

        <Input
          label="Borítókép URL"
          value={image}
          onChangeText={setImage}
          placeholder="https://..."
        />

        <Input
          label="Leírás"
          value={description}
          onChangeText={setDescription}
          placeholder="Prémium modern ingatlan..."
          multiline
          height={150}
        />

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
                        ? '#D6B07B'
                        : 'rgba(255,255,255,0.06)',

                    paddingHorizontal: 22,

                    paddingVertical: 14,

                    borderRadius: 999,

                    borderWidth: 1,

                    borderColor:
                      category === item
                        ? '#D6B07B'
                        : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text
                    style={{
                      color:
                        category === item
                          ? '#000'
                          : 'white',

                      fontWeight: '700',
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>
        </View>

        {/* BUTTON */}
        <Pressable
          onPress={handleUpload}
          disabled={loading}
          style={{
            backgroundColor: '#D6B07B',
            paddingVertical: 22,
            borderRadius: 999,
            alignItems: 'center',
            marginTop: 20,
            opacity: loading ? 0.7 : 1,
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
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
        multiline={multiline}
        style={{
          backgroundColor:
            'rgba(255,255,255,0.05)',

          borderRadius: 24,

          paddingHorizontal: 20,

          paddingVertical: 18,

          color: 'white',

          fontSize: 16,

          borderWidth: 1,

          borderColor:
            'rgba(255,255,255,0.06)',

          minHeight: height || 64,

          textAlignVertical: multiline
            ? 'top'
            : 'center',
        }}
      />
    </View>
  )
}