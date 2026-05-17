import {
    Alert,
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

import { supabase } from '@/src/services/supabase'

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
                  .from('properties')
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

              setProperties((prev) =>
                prev.filter(
                  (item) =>
                    item.id !== id
                )
              )

              setPropertiesCount(
                (prev) => prev - 1
              )

              Alert.alert(
                'Sikeres törlés',
                'Az ingatlan törölve lett.'
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
      // Properties
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

      // Leads
      const {
        count: leadsTotal,
      } = await supabase
        .from('property_leads')
        .select('*', {
          count: 'exact',
          head: true,
        })

      setLeadCount(leadsTotal || 0)

      // Favorites
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

      // WhatsApp leads
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

      // Latest properties
      const { data } =
        await supabase
          .from('properties')
          .select('*')
          .order('id', {
            ascending: false,
          })
          .limit(5)

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
      {/* HEADER */}
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
          Dashboard
        </Text>

        <Text
          style={{
            color: '#8A8A93',
            marginTop: 10,
            fontSize: 16,
          }}
        >
          Luxury admin overview
        </Text>
      </Animated.View>

      {/* STATS */}
      <View
        style={{
          marginTop: 34,
          gap: 16,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: 16,
          }}
        >
          <StatCard
            title="Ingatlan"
            value={propertiesCount}
            icon={
              <Building2
                color="#D6B07B"
                size={24}
              />
            }
          />

          <StatCard
            title="Lead"
            value={leadCount}
            icon={
              <TrendingUp
                color="#D6B07B"
                size={24}
              />
            }
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 16,
          }}
        >
          <StatCard
            title="Kedvencek"
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
      </View>

      {/* QUICK ACTIONS */}
      <View
        style={{
          marginTop: 42,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 24,
            fontWeight: '800',
            marginBottom: 18,
          }}
        >
          Gyors műveletek
        </Text>

        <Pressable
          onPress={() =>
            router.push('/upload')
          }
          style={{
            backgroundColor: '#D6B07B',
            borderRadius: 999,
            paddingVertical: 20,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Plus
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
            Új ingatlan feltöltése
          </Text>
        </Pressable>
      </View>

      {/* LATEST PROPERTIES */}
      <View
        style={{
          marginTop: 42,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 24,
            fontWeight: '800',
            marginBottom: 18,
          }}
        >
          Legutóbbi ingatlanok
        </Text>

        <View
          style={{
            gap: 18,
          }}
        >
          {properties.map(
            (property, index) => (
              <Animated.View
                key={property.id}
                entering={FadeInDown.delay(
                  250 + index * 100
                ).springify()}
              >
                <View
                  style={{
                    backgroundColor:
                      'rgba(255,255,255,0.04)',

                    borderRadius: 28,

                    overflow: 'hidden',

                    borderWidth: 1,

                    borderColor:
                      'rgba(255,255,255,0.06)',
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
                        height: 210,
                      }}
                    />

                    <View
                      style={{
                        padding: 20,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            'white',

                          fontSize: 22,

                          fontWeight:
                            '800',
                        }}
                      >
                        {property.title}
                      </Text>

                      <Text
                        style={{
                          color:
                            '#8A8A93',

                          marginTop: 8,

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
                            '#D6B07B',

                          marginTop: 14,

                          fontSize: 28,

                          fontWeight:
                            '300',
                        }}
                      >
                        {property.price}
                      </Text>
                    </View>
                  </Pressable>

                  {/* ACTIONS */}
                  <View
                    style={{
                      paddingHorizontal: 20,
                      paddingBottom: 20,
                      gap: 12,
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
                          'rgba(255,255,255,0.06)',

                        borderRadius: 18,

                        paddingVertical: 14,

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
                            '700',
                        }}
                      >
                        ✏️ Szerkesztés
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
                          'rgba(255,80,80,0.12)',

                        borderRadius: 18,

                        paddingVertical: 14,

                        alignItems:
                          'center',

                        borderWidth: 1,

                        borderColor:
                          'rgba(255,80,80,0.18)',
                      }}
                    >
                      <Text
                        style={{
                          color: '#FF6B6B',

                          fontSize: 15,

                          fontWeight:
                            '700',
                        }}
                      >
                        🗑️ Törlés
                      </Text>
                    </Pressable>
                  </View>
                </View>
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
    <View
      style={{
        flex: 1,

        backgroundColor:
          'rgba(255,255,255,0.04)',

        borderRadius: 28,

        padding: 22,

        borderWidth: 1,

        borderColor:
          'rgba(255,255,255,0.06)',
      }}
    >
      {icon}

      <Text
        style={{
          color: '#71717A',
          marginTop: 16,
          fontSize: 14,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: 'white',
          marginTop: 10,
          fontSize: 34,
          fontWeight: '800',
        }}
      >
        {value}
      </Text>
    </View>
  )
}