import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'

import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import {
  router,
  useLocalSearchParams,
} from 'expo-router'

import {
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  Heart,
  Mail,
  MapPin,
  Maximize,
  MessageCircle,
  Pencil,
  Phone,
  Star,
  Trash2,
  X,
} from 'lucide-react-native'

import Animated, {
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import { supabase } from '@/src/services/supabase'

const screenWidth =
  Dimensions.get('window').width

const HERO_HEIGHT =
  screenWidth > 900 ? 720 : 620

const AGENT_PHONE =
  '+36301234567'

const AGENT_EMAIL =
  'info@realvia.hu'

const AGENT_NAME =
  'Varga Anna'

const AGENT_ROLE =
  'Luxury Property Advisor'

const AGENT_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop'

const MAP_PREVIEW_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop'

interface Property {
  id: string
  title: string
  image: string
  gallery?: any[] | string
  location: string
  price: string
  description?: string
  bedrooms?: number | string
  bathrooms?: number | string
  size?: number | string
  parking?: number | string
  neighborhood?: string
  latitude?: number
  longitude?: number
}

export default function PropertyDetail() {
  const { id } =
    useLocalSearchParams()

  const insets =
    useSafeAreaInsets()

  const [property, setProperty] =
    useState<Property | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [isFavorite, setIsFavorite] =
    useState(false)

  const [currentImage, setCurrentImage] =
    useState(0)

  const [contactVisible, setContactVisible] =
    useState(false)

  const scrollY =
    useSharedValue(0)

  const heartScale =
    useSharedValue(1)

  const mapScale =
    useSharedValue(1)

  const heroScrollRef =
    useRef<any>(null)

  const timeoutRef =
    useRef<any>(null)

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

  async function trackLead(action: string) {
    try {
      if (!property?.id) return

      await supabase
        .from('property_leads')
        .insert({
          property_id: property.id,
          action,
          source: 'property_detail',
        })
    } catch (error) {
      console.log('Lead tracking error:', error)
    }
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

  async function checkFavorite() {
    try {
      if (!property?.id) return

      const { data } =
        await supabase
          .from('favorites')
          .select('id')
          .eq('property_id', property.id)
          .maybeSingle()

      setIsFavorite(!!data)
    } catch (error) {
      console.log(error)
    }
  }

  async function toggleFavorite() {
    try {
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
        .maybeSingle()

      if (existingFavorite) {
        setIsFavorite(false)

        await supabase
          .from('favorites')
          .delete()
          .eq('property_id', property.id)

        await trackLead('favorite_removed')

        return
      }

      setIsFavorite(true)

      heartScale.value =
        withSpring(1.18)

      timeoutRef.current =
        setTimeout(() => {
          heartScale.value =
            withSpring(1)
        }, 120)

      await supabase
        .from('favorites')
        .insert({
          property_id: property.id,
        })

      await trackLead('favorite_added')
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'Váratlan hiba történt.'
      )
    }
  }

  function openContactModal() {
    haptic(Haptics.ImpactFeedbackStyle.Light)
    trackLead('contact_modal_opened')
    setContactVisible(true)
  }

  function closeContactModal() {
    haptic(Haptics.ImpactFeedbackStyle.Light)
    setContactVisible(false)
  }

  async function openPhone() {
    await haptic(
      Haptics.ImpactFeedbackStyle.Rigid
    )

    await trackLead('phone')

    Linking.openURL(`tel:${AGENT_PHONE}`)
  }

  async function openEmail() {
    await haptic(
      Haptics.ImpactFeedbackStyle.Light
    )

    await trackLead('email')

    Linking.openURL(
      `mailto:${AGENT_EMAIL}?subject=${encodeURIComponent(
        property
          ? `Érdeklődés: ${property.title}`
          : 'Ingatlan érdeklődés'
      )}`
    )
  }

  async function openWhatsApp() {
    await haptic(
      Haptics.ImpactFeedbackStyle.Rigid
    )

    await trackLead('whatsapp')

    const message =
      property
        ? `Szia, érdeklődöm az alábbi ingatlan iránt: ${property.title}`
        : 'Szia, érdeklődöm egy prémium ingatlan iránt.'

    Linking.openURL(
      `https://wa.me/${AGENT_PHONE.replace(
        '+',
        ''
      )}?text=${encodeURIComponent(message)}`
    )
  }

  async function openBooking() {
    await haptic(
      Haptics.ImpactFeedbackStyle.Rigid
    )

    await trackLead('booking_cta')

    setContactVisible(true)
  }

  async function openMap() {
    await haptic(
      Haptics.ImpactFeedbackStyle.Medium
    )

    await trackLead('map_opened')

    mapScale.value =
      withSpring(1.12)

    setTimeout(() => {
      mapScale.value =
        withSpring(1)
    }, 140)

    if (property?.latitude && property?.longitude) {
      const label =
        encodeURIComponent(property.title)

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
  }

  useEffect(() => {
    loadProperty()
  }, [id])

  useEffect(() => {
    checkFavorite()
  }, [property])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const scrollHandler =
    useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollY.value =
          event.contentOffset.y
      },
    })

  const imageAnimatedStyle =
    useAnimatedStyle(() => {
      const scale = interpolate(
        scrollY.value,
        [-200, 0, 300],
        [1.08, 1, 1]
      )

      const translateY =
        interpolate(
          scrollY.value,
          [-200, 0, 300],
          [-30, 0, 90]
        )

      return {
        transform: [
          { scale },
          { translateY },
        ],
      }
    })

  const heartAnimatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: heartScale.value,
        },
      ],
    }))

  const mapAnimatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: mapScale.value,
        },
      ],
    }))

  const galleryImages =
    useMemo(() => {
      if (!property) return []

      try {
        const parsedGallery =
          Array.isArray(property.gallery)
            ? property.gallery
            : typeof property.gallery === 'string'
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

  const stats =
    useMemo(() => {
      return [
        {
          label: 'Hálószoba',
          value: property?.bedrooms || '4',
          icon: BedDouble,
        },
        {
          label: 'Fürdő',
          value: property?.bathrooms || '3',
          icon: Bath,
        },
        {
          label: 'Méret',
          value: property?.size
            ? `${property.size}m²`
            : '320m²',
          icon: Maximize,
        },
        {
          label: 'Parkoló',
          value: property?.parking || '2',
          icon: Car,
        },
      ]
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
        <ActivityIndicator
          size="large"
          color="#D6B98C"
        />
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
        {/* HERO */}
        <View
          style={{
            height: HERO_HEIGHT,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              {
                flex: 1,
              },
              imageAnimatedStyle,
            ]}
          >
            <Animated.ScrollView
              ref={heroScrollRef}
              horizontal
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={screenWidth}
              snapToAlignment="start"
              disableIntervalMomentum
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index =
                  Math.round(
                    event.nativeEvent
                      .contentOffset.x /
                      screenWidth
                  )

                setCurrentImage(index)
              }}
            >
              {galleryImages.map(
                (image: string, index: number) => (
                  <View
                    key={index}
                    style={{
                      width: screenWidth,
                      height: HERO_HEIGHT,
                    }}
                  >
                    <Image
                      source={{ uri: image }}
                      contentFit="cover"
                      transition={240}
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
                        paddingTop:
                          insets.top + 24,
                        paddingHorizontal: 20,
                        paddingBottom: 120,
                      }}
                    >
                      <BlurView
                        intensity={60}
                        tint="dark"
                        experimentalBlurMethod="dimezisBlurView"
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
                          onPress={() => {
                            haptic()
                            try {
                              router.back()
                            } catch {
                              router.replace('/')
                            }
                          }}
                          style={{
                            flex: 1,
                            justifyContent:
                              'center',
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
    top: insets.top + 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  }}
>
  {/* EDIT */}
  <BlurView
    intensity={64}
    tint="dark"
    experimentalBlurMethod="dimezisBlurView"
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
      onPress={() => {
        haptic()

        router.push(
  `/property/edit/${property.id}`
        )
      }}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Pencil
        size={22}
        color="#D6B07B"
      />
    </Pressable>
  </BlurView>

  {/* DELETE */}
  <BlurView
    intensity={64}
    tint="dark"
    experimentalBlurMethod="dimezisBlurView"
    style={{
      width: 58,
      height: 58,
      borderRadius: 29,
      overflow: 'hidden',
      backgroundColor:
        'rgba(80,20,20,0.35)',
    }}
  >
    <Pressable
      onPress={() => {
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
                  await haptic(
                    Haptics
                      .ImpactFeedbackStyle
                      .Heavy
                  )

                  await supabase
                    .from('properties')
                    .delete()
                    .eq(
                      'id',
                      property.id
                    )

                  router.replace('/')
                } catch (error) {
                  console.log(error)

                  Alert.alert(
                    'Hiba',
                    'Nem sikerült törölni az ingatlant.'
                  )
                }
              },
            },
          ]
        )
      }}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Trash2
        size={22}
        color="#FF6B6B"
      />
    </Pressable>
  </BlurView>

  {/* FAVORITE */}
  <Animated.View
    style={heartAnimatedStyle}
  >
    <BlurView
      intensity={64}
      tint="dark"
      experimentalBlurMethod="dimezisBlurView"
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
        onPress={toggleFavorite}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
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
    </BlurView>
  </Animated.View>
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
                            textTransform:
                              'uppercase',
                          }}
                        >
                          Luxury Residence
                        </Text>
                      </View>

                      <Text
                        style={{
                          color: 'white',
                          fontSize:
                            screenWidth > 420
                              ? 46
                              : 40,
                          fontWeight: '800',
                          letterSpacing: -2,
                          lineHeight:
                            screenWidth > 420
                              ? 50
                              : 44,
                          maxWidth: '86%',
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

                      <View
                        style={{
                          marginTop: 18,
                          flexDirection: 'row',
                          alignItems: 'flex-end',
                          gap: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: '#E7D3AE',
                            fontSize: 18,
                            letterSpacing: 4,
                            textTransform:
                              'uppercase',
                          }}
                        >
                          Ár
                        </Text>

                        <Text
                          style={{
                            color: '#F3D19C',
                            fontSize:
                              screenWidth > 420
                                ? 42
                                : 36,
                            fontWeight: '200',
                            letterSpacing: -1.5,
                            lineHeight:
                              screenWidth > 420
                                ? 46
                                : 40,
                            fontFamily:
                              Platform.OS === 'web'
                                ? 'Didot, Baskerville, serif'
                                : undefined,
                          }}
                        >
                          {property.price}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                )
              )}
            </Animated.ScrollView>
          </Animated.View>

          {/* PAGINATION */}
          <View
            style={{
              position: 'absolute',
              bottom: 28,
              alignSelf: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            {galleryImages.map(
              (_: string, index: number) => (
                <View
                  key={index}
                  style={{
                    width:
                      currentImage === index
                        ? 24
                        : 7,
                    height: 7,
                    borderRadius: 999,
                    backgroundColor:
                      currentImage === index
                        ? '#F3D19C'
                        : 'rgba(255,255,255,0.4)',
                  }}
                />
              )
            )}
          </View>
        </View>

        {/* THUMBNAILS */}
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
            {galleryImages.map(
              (image: string, index: number) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    haptic()
                    setCurrentImage(index)

                    heroScrollRef.current?.scrollTo({
                      x: index * screenWidth,
                      animated: true,
                    })
                  }}
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

        {/* PROPERTY STATS */}
        <Animated.View
          entering={FadeInUp.duration(550)}
          style={{
            paddingHorizontal: 24,
            paddingTop: 30,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              backgroundColor:
                'rgba(255,255,255,0.045)',
              borderColor:
                'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderRadius: 30,
              paddingVertical: 20,
              paddingHorizontal: 8,
            }}
          >
            {stats.map((item) => {
              const Icon = item.icon

              return (
                <View
                  key={item.label}
                  style={{
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <Icon
                    size={22}
                    color="#D6B07B"
                  />

                  <Text
                    style={{
                      color: 'white',
                      fontSize: 21,
                      fontWeight: '800',
                      marginTop: 10,
                    }}
                  >
                    {item.value}
                  </Text>

                  <Text
                    style={{
                      color: '#8F8F95',
                      marginTop: 5,
                      fontSize: 12,
                    }}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </View>
              )
            })}
          </View>
        </Animated.View>

        {/* AGENT */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={{
            paddingHorizontal: 24,
            paddingTop: 30,
          }}
        >
          <View
            style={{
              backgroundColor:
                'rgba(255,255,255,0.045)',
              borderColor:
                'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderRadius: 28,
              padding: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Image
              source={{ uri: AGENT_AVATAR }}
              contentFit="cover"
              style={{
                width: 62,
                height: 62,
                borderRadius: 31,
              }}
            />

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: '800',
                }}
              >
                {AGENT_NAME}
              </Text>

              <Text
                style={{
                  color: '#A1A1AA',
                  marginTop: 4,
                  fontSize: 14,
                }}
              >
                {AGENT_ROLE}
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor:
                  'rgba(214,176,123,0.14)',
              }}
            >
              <Text
                style={{
                  color: '#D6B07B',
                  fontSize: 12,
                  fontWeight: '800',
                }}
              >
                Verified
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* CONTACT BUTTON */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 28,
          }}
        >
          <Pressable
            onPress={openContactModal}
            style={{
              backgroundColor: '#D6B07B',
              paddingVertical: 22,
              borderRadius: 999,
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
              Privát túra foglalása
            </Text>
          </Pressable>
        </View>

        {/* DESCRIPTION */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 34,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 30,
              fontWeight: '700',
              marginBottom: 18,
            }}
          >
            Ingatlan leírása
          </Text>

          <Text
            style={{
              color: '#A1A1AA',
              fontSize: 17,
              lineHeight: 32,
            }}
          >
            {property.description ||
              'Kivételes prémium ingatlan modern építészettel, privát hangulattal és luxus életérzéssel. A tágas terek, a természetes fény és az elegáns anyaghasználat egy olyan otthont teremtenek, amely egyszerre nyugodt, exkluzív és inspiráló.'}
          </Text>
        </View>

        {/* NEIGHBORHOOD EXPERIENCE */}
        <Animated.View
          entering={FadeInUp.duration(700)}
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
              onPress={openMap}
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
            onPress={openMap}
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
              transition={240}
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
                {property.neighborhood ||
                  property.location}
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
        </Animated.View>

        {/* LOCATION HIGHLIGHTS */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: insets.bottom + 180,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            {[
              'Fine dining',
              'Luxury shopping',
              'Private schools',
              'Wellness clubs',
            ].map((item) => (
              <View
                key={item}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 11,
                  borderRadius: 999,
                  backgroundColor:
                    'rgba(255,255,255,0.055)',
                  borderWidth: 1,
                  borderColor:
                    'rgba(255,255,255,0.07)',
                }}
              >
                <Text
                  style={{
                    color: '#D6B07B',
                    fontWeight: '700',
                  }}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* FLOATING MAP CTA */}
      {!contactVisible && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 24,
              bottom: insets.bottom + 96,
              borderRadius: 33,
              overflow: 'hidden',
            },
            mapAnimatedStyle,
          ]}
        >
          <BlurView
            intensity={70}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={{
              width: 66,
              height: 66,
              borderRadius: 33,
              backgroundColor:
                'rgba(12,12,14,0.55)',
              borderWidth: 1,
              borderColor:
                'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <Pressable
              onPress={openMap}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MapPin
                size={27}
                color="#F3D19C"
              />
            </Pressable>
          </BlurView>
        </Animated.View>
      )}

      {/* STICKY BOTTOM CTA */}
      {!contactVisible && (
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: insets.bottom + 16,
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <BlurView
            intensity={70}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={{
              padding: 8,
              backgroundColor:
                'rgba(12,12,14,0.55)',
              borderRadius: 999,
              borderWidth: 1,
              borderColor:
                'rgba(255,255,255,0.08)',
            }}
          >
            <Pressable
              onPress={openBooking}
              style={{
                backgroundColor: '#D6B07B',
                borderRadius: 999,
                paddingVertical: 18,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 10,
              }}
            >
              <CalendarDays
                size={21}
                color="#000"
              />

              <Text
                style={{
                  color: '#000',
                  fontSize: 17,
                  fontWeight: '900',
                }}
              >
                Privát túra foglalása
              </Text>
            </Pressable>
          </BlurView>
        </Animated.View>
      )}

      {/* CONTACT MODAL */}
      {contactVisible && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'flex-end',
          }}
        >
          <BlurView
            intensity={36}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor:
                'rgba(0,0,0,0.38)',
            }}
          />

          <Pressable
            style={{
              flex: 1,
            }}
            onPress={closeContactModal}
          />

          <Animated.View
            entering={FadeInDown
              .duration(650)
              .springify()
              .damping(18)}
            style={{
              backgroundColor: '#111114',
              borderTopLeftRadius: 36,
              borderTopRightRadius: 36,
              padding: 28,
              paddingBottom:
                insets.bottom + 24,
              borderTopWidth: 1,
              borderColor:
                'rgba(255,255,255,0.08)',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom: 26,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 28,
                    fontWeight: '800',
                  }}
                >
                  Kapcsolat
                </Text>

                <Text
                  style={{
                    color: '#A1A1AA',
                    marginTop: 6,
                    fontSize: 15,
                    lineHeight: 22,
                  }}
                >
                  {AGENT_NAME} segít a privát megtekintésben
                </Text>
              </View>

              <Pressable
                onPress={closeContactModal}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor:
                    'rgba(255,255,255,0.06)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: 16,
                }}
              >
                <X
                  size={24}
                  color="white"
                />
              </Pressable>
            </View>

            <View
              style={{
                gap: 16,
              }}
            >
              <Pressable
                onPress={openPhone}
                style={{
                  backgroundColor:
                    'rgba(255,255,255,0.055)',
                  borderRadius: 24,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  borderWidth: 1,
                  borderColor:
                    'rgba(255,255,255,0.06)',
                }}
              >
                <Phone
                  size={24}
                  color="#D6B07B"
                />

                <View>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 17,
                      fontWeight: '700',
                    }}
                  >
                    Telefon
                  </Text>

                  <Text
                    style={{
                      color: '#A1A1AA',
                      marginTop: 4,
                    }}
                  >
                    +36 30 123 4567
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={openEmail}
                style={{
                  backgroundColor:
                    'rgba(255,255,255,0.055)',
                  borderRadius: 24,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  borderWidth: 1,
                  borderColor:
                    'rgba(255,255,255,0.06)',
                }}
              >
                <Mail
                  size={24}
                  color="#D6B07B"
                />

                <View>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 17,
                      fontWeight: '700',
                    }}
                  >
                    Email
                  </Text>

                  <Text
                    style={{
                      color: '#A1A1AA',
                      marginTop: 4,
                    }}
                  >
                    {AGENT_EMAIL}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={openWhatsApp}
                style={{
                  backgroundColor: '#D6B07B',
                  borderRadius: 24,
                  padding: 22,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 10,
                }}
              >
                <MessageCircle
                  size={22}
                  color="#000"
                />

                <Text
                  style={{
                    color: '#000',
                    fontSize: 17,
                    fontWeight: '900',
                  }}
                >
                  WhatsApp konzultáció
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
    </>
  )
}
