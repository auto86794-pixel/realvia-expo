import React, {
  useEffect,
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
  CalendarDays,
  Heart,
  Mail,
  MessageCircle,
  Phone,
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

interface Property {
  id: string
  title: string
  image: string
  gallery?: any[]
  location: string
  price: string
  description?: string
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

  const [
    currentImage,
    setCurrentImage,
  ] = useState(0)

  const [
    contactVisible,
    setContactVisible,
  ] = useState(false)

  const scrollY =
    useSharedValue(0)

  const heartScale =
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
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 24,
            fontWeight: '700',
          }}
        >
          Az ingatlan nem található
        </Text>
      </View>
    )
  }

  const parsedGallery = (() => {
    try {
      if (Array.isArray(property.gallery)) {
        return property.gallery
      }

      if (
        typeof property.gallery === 'string'
      ) {
        return JSON.parse(property.gallery)
      }

      return []
    } catch {
      return []
    }
  })()

  const galleryImages = (
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
              showsHorizontalScrollIndicator={
                false
              }
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
                (
                  image: string,
                  index: number
                ) => (
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

                    <Animated.View
                      style={[
                        {
                          position: 'absolute',
                          top: insets.top + 24,
                          right: 24,
                        },
                        heartAnimatedStyle,
                      ]}
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
                          onPress={
                            toggleFavorite
                          }
                          style={{
                            flex: 1,
                            justifyContent:
                              'center',
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
                      <Text
                        style={{
                          color:
                            'rgba(255,255,255,0.62)',
                          fontSize: 13,
                          fontWeight: '600',
                          letterSpacing: 4,
                          textTransform:
                            'uppercase',
                          marginBottom: 14,
                        }}
                      >
                        Kalifornia
                      </Text>

                      <Text
                        style={{
                          color: 'white',
                          fontSize: 46,
                          fontWeight: '800',
                          letterSpacing: -2,
                          lineHeight: 50,
                          maxWidth: '82%',
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
                            fontSize: 42,
                            fontWeight: '200',
                            letterSpacing: -1.5,
                            lineHeight: 46,
                            fontFamily:
                              Platform.OS ===
                              'web'
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
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={{
              gap: 14,
              paddingRight: 24,
            }}
          >
            {galleryImages.map(
              (
                image: string,
                index: number
              ) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    haptic()
                    setCurrentImage(index)

                    heroScrollRef.current?.scrollTo(
                      {
                        x:
                          index *
                          screenWidth,
                        animated: true,
                      }
                    )
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

        {/* AGENT */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={{
            paddingHorizontal: 24,
            paddingTop: 34,
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
              Privát megtekintés foglalása
            </Text>
          </Pressable>
        </View>

        {/* DESCRIPTION */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 34,
            paddingBottom:
              insets.bottom + 180,
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
              'Kivételes prémium ingatlan modern építészettel és luxus életérzéssel.'}
          </Text>
        </View>
      </Animated.ScrollView>

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
                Privát megtekintés
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
              <View>
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