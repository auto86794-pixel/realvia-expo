import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'

import {
  useCallback,
  useState,
} from 'react'

import {
  router,
  useFocusEffect,
} from 'expo-router'

import {
  Building2,
  Heart,
  MessageCircle,
  Plus,
  TrendingUp,
} from 'lucide-react-native'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import { Image } from 'expo-image'

import { BlurView } from 'expo-blur'

import { supabase } from '@/src/services/supabase'

import {
  Colors,
  Radius,
  Shadows,
} from '@/constants/theme'

export default function Dashboard() {
  const [
    propertiesCount,
    setPropertiesCount,
  ] = useState(0)

  const [leadCount, setLeadCount] =
    useState(0)

  const [
    favoritesCount,
    setFavoritesCount,
  ] = useState(0)

  const [
    whatsappCount,
    setWhatsappCount,
  ] = useState(0)

  const [properties, setProperties] =
    useState<any[]>([])

  async function handleDelete(
    id: string
  ) {
    try {
      Alert.alert(
        'Delete Property',
        'Are you sure you want to delete this property?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',

            onPress: async () => {
              const { error } =
                await supabase
                  .from('properties')
                  .delete()
                  .eq('id', id)

              if (error) {
                console.log(error)

                Alert.alert(
                  'Error',
                  'Delete failed.'
                )

                return
              }

              setProperties((prev) =>
                prev.filter(
                  (item) =>
                    item.id !== id
                )
              )

              setPropertiesCount(
                (prev) => prev - 1
              )
            },
          },
        ]
      )
    } catch (error) {
      console.log(error)
    }
  }

  async function loadDashboard() {
    try {
      const {
        count: propertiesTotal,
      } = await supabase
        .from('properties')
        .select('*', {
          count: 'exact',
          head: true,
        })

      setPropertiesCount(
        propertiesTotal || 0
      )

      const {
        count: leadsTotal,
      } = await supabase
        .from('property_leads')
        .select('*', {
          count: 'exact',
          head: true,
        })

      setLeadCount(leadsTotal || 0)

      const {
        count: favoritesTotal,
      } = await supabase
        .from('favorites')
        .select('*', {
          count: 'exact',
          head: true,
        })

      setFavoritesCount(
        favoritesTotal || 0
      )

      const {
        count: whatsappTotal,
      } = await supabase
        .from('property_leads')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('action', 'whatsapp')

      setWhatsappCount(
        whatsappTotal || 0
      )

      const { data } =
        await supabase
          .from('properties')
          .select('*')
          .order('id', {
            ascending: false,
          })
          .limit(6)

      if (data) {
        setProperties(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadDashboard()
    }, [])
  )

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor:
          Colors.dark.background,
      }}
      contentContainerStyle={{
        paddingBottom: 180,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HERO */}
      <View
        style={{
          paddingTop: 90,
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
      >
        <Animated.View
          entering={FadeInDown.springify()}
        >
          <Text
            style={{
              color: 'white',
              fontSize:
                Platform.OS === 'web'
                  ? 64
                  : 42,
              fontWeight: '900',
              letterSpacing: -3,
            }}
          >
            Dashboard
          </Text>

          <Text
            style={{
              color: '#8A8A93',
              marginTop: 12,
              fontSize: 18,
            }}
          >
            Luxury admin overview
          </Text>
        </Animated.View>

        {/* STATS */}
        <View
          style={{
            marginTop: 38,

            flexDirection: 'row',

            flexWrap: 'wrap',

            justifyContent:
              'space-between',

            rowGap: 18,
          }}
        >
          <StatCard
            title="Properties"
            value={propertiesCount}
            icon={
              <Building2
                color="#D6B07B"
                size={24}
              />
            }
          />

          <StatCard
            title="Leads"
            value={leadCount}
            icon={
              <TrendingUp
                color="#D6B07B"
                size={24}
              />
            }
          />

          <StatCard
            title="Favorites"
            value={favoritesCount}
            icon={
              <Heart
                color="#D6B07B"
                size={24}
              />
            }
          />

          <StatCard
            title="WhatsApp"
            value={whatsappCount}
            icon={
              <MessageCircle
                color="#D6B07B"
                size={24}
              />
            }
          />
        </View>

        {/* CTA */}
        <Animated.View
          entering={FadeInDown.delay(
            120
          ).springify()}
          style={{
            marginTop: 34,
          }}
        >
          <Pressable
            onPress={() =>
              router.push('/upload')
            }
            style={{
              backgroundColor:
                Colors.dark.primary,

              borderRadius:
                Radius.full,

              paddingVertical: 22,

              alignItems: 'center',

              flexDirection: 'row',

              justifyContent:
                'center',

              gap: 14,

              ...Shadows.glow,
            }}
          >
            <Plus
              size={22}
              color="#000"
            />

            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '900',
              }}
            >
              Upload Property
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* PROPERTIES */}
      <View
        style={{
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            flexDirection: 'row',

            justifyContent:
              'space-between',

            alignItems: 'center',

            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 34,
              fontWeight: '900',
              letterSpacing: -2,
            }}
          >
            Latest Properties
          </Text>

          <Text
            style={{
              color:
                Colors.dark.primary,
              fontWeight: '700',
            }}
          >
            {properties.length} total
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',

            flexWrap: 'wrap',

            justifyContent:
              'space-between',

            rowGap: 24,
          }}
        >
          {properties.map(
            (property, index) => (
              <Animated.View
                key={property.id}
                entering={FadeInDown.delay(
                  200 +
                    index * 120
                ).springify()}
                style={{
                  width:
                    Platform.OS ===
                    'web'
                      ? '32%'
                      : '100%',
                }}
              >
                <BlurView
                  intensity={40}
                  tint="dark"
                  style={{
                    borderRadius:
                      Radius.lg,

                    overflow:
                      'hidden',

                    backgroundColor:
                      'rgba(255,255,255,0.04)',

                    borderWidth: 1,

                    borderColor:
                      'rgba(255,255,255,0.06)',

                    ...Shadows
                      .luxury,
                  }}
                >
                  <Pressable
                    onPress={() =>
                      router.push(
                        `/property/${property.id}`
                      )
                    }
                  >
                    <Image
                      source={{
                        uri:
                          property.image,
                      }}
                      contentFit="cover"
                      style={{
                        width: '100%',
                        height: 240,
                      }}
                    />

                    <View
                      style={{
                        padding: 24,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            'white',

                          fontSize: 24,

                          fontWeight:
                            '800',
                        }}
                      >
                        {
                          property.title
                        }
                      </Text>

                      <Text
                        style={{
                          color:
                            '#8A8A93',

                          marginTop: 10,

                          fontSize: 15,
                        }}
                      >
                        📍{' '}
                        {
                          property.location
                        }
                      </Text>

                      <Text
                        style={{
                          color:
                            Colors.dark
                              .primary,

                          marginTop: 18,

                          fontSize: 30,

                          fontWeight:
                            '700',
                        }}
                      >
                        {
                          property.price
                        }
                      </Text>
                    </View>
                  </Pressable>

                  {/* ACTIONS */}
                  <View
                    style={{
                      paddingHorizontal: 24,
                      paddingBottom: 24,
                      gap: 14,
                    }}
                  >
                    <Pressable
                      onPress={() =>
                        router.push(
                          `/property/edit/${property.id}`
                        )
                      }
                      style={{
                        backgroundColor:
                          'rgba(255,255,255,0.08)',

                        borderRadius: 20,

                        paddingVertical: 16,

                        alignItems:
                          'center',

                        borderWidth: 1,

                        borderColor:
                          'rgba(255,255,255,0.08)',
                      }}
                    >
                      <Text
                        style={{
                          color:
                            'white',

                          fontSize: 15,

                          fontWeight:
                            '800',
                        }}
                      >
                        ✏️ Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        handleDelete(
                          String(
                            property.id
                          )
                        )
                      }
                      style={{
                        backgroundColor:
                          'rgba(255,80,80,0.14)',

                        borderRadius: 20,

                        paddingVertical: 16,

                        alignItems:
                          'center',

                        borderWidth: 1,

                        borderColor:
                          'rgba(255,80,80,0.18)',
                      }}
                    >
                      <Text
                        style={{
                          color:
                            '#FF6B6B',

                          fontSize: 15,

                          fontWeight:
                            '800',
                        }}
                      >
                        🗑️ Delete
                      </Text>
                    </Pressable>
                  </View>
                </BlurView>
              </Animated.View>
            )
          )}
        </View>
      </View>
    </ScrollView>
  )
}

function StatCard({
  title,
  value,
  icon,
}: any) {
  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={{
        width:
          Platform.OS === 'web'
            ? '24%'
            : '48%',

        borderRadius:
          Radius.lg,

        overflow: 'hidden',

        backgroundColor:
          'rgba(255,255,255,0.05)',

        borderWidth: 1,

        borderColor:
          'rgba(255,255,255,0.06)',

        padding: 24,

        ...Shadows.luxury,
      }}
    >
      {icon}

      <Text
        style={{
          color: '#71717A',
          marginTop: 18,
          fontSize: 14,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: 'white',
          marginTop: 12,
          fontSize: 38,
          fontWeight: '900',
          letterSpacing: -1,
        }}
      >
        {value}
      </Text>
    </BlurView>
  )
}