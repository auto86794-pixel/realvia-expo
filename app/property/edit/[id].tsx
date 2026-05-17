import {
    Alert,
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

import { supabase } from '@/src/services/supabase'

export default function EditProperty() {
  const { id } =
    useLocalSearchParams()

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

  const [initialLoading, setInitialLoading] =
    useState(true)

  const categories = [
    'Villa',
    'Modern',
    'Luxus',
    'Penthouse',
    'Tengerpart',
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
        setImage(data.image || '')
        setDescription(
          data.description || ''
        )
        setCategory(
          data.category || 'Villa'
        )
      }
    } catch (error) {
      console.log(error)
    } finally {
      setInitialLoading(false)
    }
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
            image,
            description,
            category,
            gallery: [image],
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

  useEffect(() => {
    loadProperty()
  }, [])

  if (initialLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#05060A',
        }}
      />
    )
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#05060A',
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
          Ingatlan szerkesztése
        </Text>

        <Text
          style={{
            color: '#8A8A93',
            marginTop: 10,
            fontSize: 16,
          }}
        >
          Módosítsd az ingatlan adatait.
        </Text>
      </Animated.View>

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
          label="Borítókép URL"
          value={image}
          onChangeText={setImage}
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

        {/* CATEGORY */}
        <View>
          <Text
            style={{
              color: 'white',
              fontSize: 15,
              fontWeight: '700',
              marginBottom: 12,
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
          onPress={handleUpdate}
          disabled={loading}
          style={{
            backgroundColor: '#D6B07B',
            paddingVertical: 22,
            borderRadius: 999,
            alignItems: 'center',
            marginTop: 20,
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
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor="#666"
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