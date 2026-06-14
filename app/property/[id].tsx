import React, {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native'

import * as Haptics from 'expo-haptics'

import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'

import {
  router,
  useLocalSearchParams,
} from 'expo-router'

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import { supabase } from '@/src/services/supabase'

import InquiryModal from '../../components/InquiryModal'

import PropertyHero from '../../components/property/PropertyHero'

import PropertyGallery from '../../components/property/PropertyGallery'

import PropertyStats from '../../components/property/PropertyStats'

import PropertyAgent from '../../components/property/PropertyAgent'

import PropertyDescription from '../../components/property/PropertyDescription'

import PropertyLocation from '../../components/property/PropertyLocation'

import FullscreenGalleryModal from '../../components/property/FullscreenGalleryModal'

interface Property {
  id: number
  title: string
  image: string
  gallery?: any[] | string
  location: string
  price: string
  description?: string
  bedrooms?: number | string
  bathrooms?: number | string
  size?: number | string
  area?: number | string
  category?: string
  parking?: number | string
  neighborhood?: string
  latitude?: number
  longitude?: number
}

export default function PropertyDetail() {
  const { id } =
    useLocalSearchParams()

  useSafeAreaInsets()

  const [property, setProperty] =
    useState<Property | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [isFavorite, setIsFavorite] =
    useState(false)

  const [userId, setUserId] =
    useState<string | null>(null)

  const [currentImage, setCurrentImage] =
    useState(0)

  const [galleryVisible,
setGalleryVisible] =
    useState(false)

  const [inquiryVisible,
setInquiryVisible] =
    useState(false)

  const scrollY =
    useSharedValue(0)

  

  async function haptic(
    style:
      | Haptics.ImpactFeedbackStyle.Light
      | Haptics.ImpactFeedbackStyle.Medium
      | Haptics.ImpactFeedbackStyle.Heavy
      | Haptics.ImpactFeedbackStyle.Rigid =
      Haptics.ImpactFeedbackStyle.Light
  ) {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(style)
      }
    } catch {}
  }

  async function loadProperty() {
    try {
      setLoading(true)

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

      setProperty(data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  async function loadUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUserId(user?.id ?? null)
    } catch (error) {
      console.log(error)
    }
  }

  async function checkFavorite() {
    try {
      if (!property?.id || !userId) return

      const { data } =
        await supabase
          .from('favorites')
          .select('id')
          .eq('property_id', property.id)
          .eq('user_id', userId)
          .maybeSingle()

      setIsFavorite(!!data)
    } catch (error) {
      console.log(error)
    }
  }

  async function toggleFavorite() {
    try {
      if (!userId) {
        Alert.alert(
          'Bejelentkezés szükséges',
          'A kedvencek használatához jelentkezz be.'
        )
        return
      }

      if (!property?.id) return

      await haptic(
        Haptics.ImpactFeedbackStyle.Medium
      )

      const {
        
  data: existingFavorite,
} = await supabase
  .from('favorites')
  .select('id')
  .eq('property_id', property.id)
  .eq('user_id', userId)
  .maybeSingle()

      if (existingFavorite) {
        setIsFavorite(false)

        await supabase
          .from('favorites')
          .delete()
          .eq('property_id', property.id)
          .eq('user_id', userId)

        return
      }

      setIsFavorite(true)

      
      await supabase
        .from('favorites')
        .insert({
          property_id: property.id,
          user_id: userId,
        })
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'Váratlan hiba történt.'
      )
    }
  }

  async function openMap() {
    try {
      await haptic(
        Haptics.ImpactFeedbackStyle.Medium
      )

      if (
        property?.latitude &&
        property?.longitude
      ) {
        const label =
          encodeURIComponent(
            property.title
          )

        const url =
          Platform.OS === 'ios'
            ? `maps://?q=${label}&ll=${property.latitude},${property.longitude}`
            : `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`

        Linking.openURL(url)
        return
      }

      if (property?.location) {
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            property.location
          )}`
        )
      }
    } catch (error) {
      console.log(error)
    }
  }

 useEffect(() => {
  loadProperty()
  loadUser()
}, [id])

useEffect(() => {
  checkFavorite()
}, [property?.id, userId])

  const scrollHandler =
    useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollY.value =
          event.contentOffset.y
      },
    })

  const galleryImages =
    useMemo(() => {
      if (!property) return []

      try {
        const parsedGallery =
          Array.isArray(property.gallery)
            ? property.gallery
            : typeof property.gallery ===
              'string'
            ? JSON.parse(property.gallery)
            : []

        return (
          parsedGallery.length
            ? parsedGallery
            : [property.image]
        )
          .map((item: any) => {
            if (typeof item === 'string') {
              return item
            }

            if (item?.url) {
              return item.url
            }

            return null
          })
          .filter(Boolean)
      } catch {
        return property.image
          ? [property.image]
          : []
      }
    }, [property])

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
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor:
              'rgba(214,176,123,0.08)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 30,
            borderWidth: 1,
            borderColor:
              'rgba(214,176,123,0.18)',
          }}
        >
          <ActivityIndicator
            size="large"
            color="#D6B07B"
          />
        </View>

        <Text
          style={{
            color: 'white',
            fontSize: 28,
            fontWeight: '800',
            letterSpacing: 1,
          }}
        >
          REALVIA
        </Text>

        <Text
          style={{
            color: '#8F8F95',
            marginTop: 12,
            fontSize: 15,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          Luxury Real Estate
        </Text>
      </View>
    )
  }

  if (!property) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#05060A',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 24,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          Az ingatlan nem található
        </Text>
      </View>
    )
  }

  return (
    <>
      <Animated.ScrollView
        style={{
          flex: 1,
          backgroundColor: '#05060A',
        }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <PropertyHero
          property={property}
          image={
            galleryImages[currentImage]
          }
          isFavorite={isFavorite}
          onBack={() => {
            try {
              router.back()
            } catch {
              router.replace('/')
            }
          }}
          onEdit={() => {
            router.push(
              `/property/edit/${property.id}`
            )
          }}
          onDelete={() => {
            Alert.alert(
              'Ingatlan törlése',
              'Biztosan törölni szeretnéd?',
              [
                {
                  text: 'Mégse',
                  style: 'cancel',
                },
                {
                  text: 'Törlés',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const { error } =
                        await supabase
                          .from('properties')
                          .delete()
                          .eq(
                            'id',
                            property.id
                          )

                      console.log(
                        'DELETE ERROR:',
                        error
                      )

                      if (error) {
                        Alert.alert(
                          'DELETE ERROR',
                          error.message
                        )
                        return
                      }

                      Alert.alert(
                        'Siker',
                        'Az ingatlan törölve lett.'
                      )

                      router.replace('/')
                    } catch (error) {
                      console.log(error)

                      Alert.alert(
                        'Hiba',
                        'Nem sikerült törölni.'
                      )
                    }
                  },
                },
              ]
            )
          }}
          onFavorite={toggleFavorite}
        />


        <View
          style={{
            paddingHorizontal: 24,
            marginTop: 20,
          }}
        >
          {property.location && (
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              📍 {property.location}
            </Text>
          )}

          {property.category && (
            <Text
              style={{
                color: '#D6B07B',
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              {property.category}
            </Text>
          )}
        </View>

        <PropertyGallery
          images={galleryImages}
          currentImage={currentImage}
          onSelectImage={(index) => {
            setCurrentImage(index)
            setGalleryVisible(true)
          }}
        />

        <PropertyStats
          bedrooms={property.bedrooms}
          bathrooms={property.bathrooms}
          size={property.area ?? property.size}
          parking={property.parking}
        />

        <PropertyAgent />

        <PropertyDescription
          description={
            property.description
          }
        />

        <PropertyLocation
          neighborhood={
            property.neighborhood
          }
          location={property.location}
          onOpenMap={openMap}
        />

        <Pressable
          onPress={() =>
            setInquiryVisible(true)
          }
          style={{
            backgroundColor: '#D6B07B',
            marginHorizontal: 24,
            marginTop: 28,
            marginBottom: 40,
            paddingVertical: 20,
            borderRadius: 22,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#000',
              fontSize: 18,
              fontWeight: '800',
            }}
          >
            Kapcsolat / Érdeklődés
          </Text>
        </Pressable>
      </Animated.ScrollView>

      <FullscreenGalleryModal
        visible={galleryVisible}
        images={galleryImages}
        currentImage={currentImage}
        onClose={() =>
          setGalleryVisible(false)
        }
        onSelectImage={(index) => {
          setCurrentImage(index)
        }}
      />

      <InquiryModal
        visible={inquiryVisible}
        onClose={() =>
          setInquiryVisible(false)
        }
        propertyId={property.id}
        propertyTitle={property.title}
      />
    </>
  )
}