import {
  Stack,
  router,
  useLocalSearchParams,
} from 'expo-router'

import React, {
  useEffect,
  useState,
} from 'react'

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native'

import { Image } from 'expo-image'

import { LinearGradient } from 'expo-linear-gradient'

import { supabase } from '@/src/services/supabase'

export default function EditProperty() {
  const { id } =
    useLocalSearchParams()

  const propertyId =
    Number(id)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [title, setTitle] =
    useState('')

  const [location, setLocation] =
    useState('')

  const [price, setPrice] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [image, setImage] =
    useState('')

  async function loadProperty() {
    try {
      if (!propertyId) {
        Alert.alert(
          'Hiba',
          'Érvénytelen ingatlan azonosító.'
        )

        router.back()

        return
      }

      setLoading(true)

      const { data, error } =
        await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single()

      if (error) {
        console.log(error)

        Alert.alert(
          'Hiba',
          'Nem sikerült betölteni az ingatlant.'
        )

        return
      }

      setTitle(data.title || '')
      setLocation(data.location || '')
      setPrice(data.price || '')
      setDescription(
        data.description || ''
      )
      setImage(data.image || '')
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

  async function saveProperty() {
    try {
      if (!title.trim()) {
        Alert.alert(
          'Hiányzó adat',
          'Adj meg egy nevet.'
        )

        return
      }

      if (!location.trim()) {
        Alert.alert(
          'Hiányzó adat',
          'Adj meg egy lokációt.'
        )

        return
      }

      if (!propertyId) {
        Alert.alert(
          'Hiba',
          'Érvénytelen ingatlan azonosító.'
        )

        return
      }

      setSaving(true)

      const { error } =
        await supabase
          .from('properties')
          .update({
            title: title.trim(),
            location:
              location.trim(),
            price: price.trim(),
            description:
              description.trim(),
          })
          .eq('id', propertyId)

      if (error) {
        console.log(error)

        Alert.alert(
          'Hiba',
          'Nem sikerült menteni.'
        )

        return
      }

      Alert.alert(
        'Siker',
        'Az ingatlan frissítve lett.'
      )

      router.back()
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'Váratlan hiba történt.'
      )
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadProperty()
  }, [id])

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#05060A',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator
          size="large"
          color="#E6C998"
        />
      </View>
    )
  }

  return (
    <>
      <StatusBar barStyle="light-content" />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: '#05060A',
        }}
        contentContainerStyle={{
          padding: 24,
          paddingTop: 110,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={{
            height: 260,
            borderRadius: 32,
            overflow: 'hidden',
            marginBottom: 34,
          }}
        >
          <Image
            source={{
              uri:
                image ||
                'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop',
            }}
            contentFit="cover"
            style={{
              width: '100%',
              height: '100%',
            }}
          />

          <LinearGradient
            colors={[
              'transparent',
              'rgba(0,0,0,0.75)',
            ]}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              justifyContent:
                'flex-end',
              padding: 24,
            }}
          >
            <View
              style={{
                backgroundColor:
                  'rgba(230,201,152,0.14)',
                borderWidth: 1,
                borderColor:
                  'rgba(230,201,152,0.22)',
                alignSelf:
                  'flex-start',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  color: '#F2E6CF',
                  fontSize: 12,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                }}
              >
                REALVIA EXCLUSIVE
              </Text>
            </View>

            <Text
              style={{
                color: 'white',
                fontSize: 32,
                fontWeight: '700',
                letterSpacing: -1,
                maxWidth: '88%',
              }}
            >
              {title || 'Luxury Villa'}
            </Text>

            <Text
              style={{
                color:
                  'rgba(255,255,255,0.72)',
                marginTop: 8,
                fontSize: 15,
                letterSpacing: 1,
              }}
            >
              {location}
            </Text>
          </LinearGradient>
        </View>

        <Text
          style={{
            color: '#F2E6CF',
            fontSize: 38,
            fontWeight: '600',
            letterSpacing: 1,
            marginBottom: 38,
          }}
        >
          Ingatlan szerkesztése
        </Text>

        <View
          style={{
            gap: 24,
          }}
        >
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ingatlan neve"
            placeholderTextColor="#777"
            style={{
              height: 68,
              borderRadius: 24,
              backgroundColor:
                'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor:
                'rgba(230,201,152,0.10)',
              paddingHorizontal: 22,
              color: '#fff',
              fontSize: 17,
            }}
          />

          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Lokáció"
            placeholderTextColor="#777"
            style={{
              height: 68,
              borderRadius: 24,
              backgroundColor:
                'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor:
                'rgba(230,201,152,0.10)',
              paddingHorizontal: 22,
              color: '#fff',
              fontSize: 17,
            }}
          />

          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="Ár"
            placeholderTextColor="#777"
            style={{
              height: 68,
              borderRadius: 24,
              backgroundColor:
                'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor:
                'rgba(230,201,152,0.10)',
              paddingHorizontal: 22,
              color: '#fff',
              fontSize: 17,
            }}
          />

          <TextInput
            value={description}
            onChangeText={
              setDescription
            }
            placeholder="Leírás"
            placeholderTextColor="#777"
            multiline
            textAlignVertical="top"
            style={{
              minHeight: 220,
              borderRadius: 28,
              backgroundColor:
                'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor:
                'rgba(230,201,152,0.10)',
              paddingHorizontal: 22,
              paddingTop: 22,
              color: '#fff',
              fontSize: 17,
              lineHeight: 30,
            }}
          />
        </View>

        <Pressable
          onPress={saveProperty}
          disabled={saving}
          style={{
            height: 70,
            borderRadius: 999,
            backgroundColor:
              '#E6C998',
            justifyContent:
              'center',
            alignItems: 'center',
            marginTop: 42,
            opacity:
              saving ? 0.7 : 1,
            shadowColor:
              '#E6C998',
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.22,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '800',
                letterSpacing: 1,
              }}
            >
              MENTÉS
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </>
  )
}