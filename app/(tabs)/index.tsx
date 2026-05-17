import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'

import {
  useCallback,
  useMemo,
  useState,
} from 'react'

import {
  router,
  useFocusEffect,
} from 'expo-router'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import CategoryTabs from '@/components/home/CategoryTabs'
import HomeHeader from '@/components/home/HomeHeader'
import SearchBar from '@/components/home/SearchBar'
import PropertyCard from '@/components/PropertyCard'
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton'

import { supabase } from '../../src/services/supabase'

import { useProtectedRoute } from '../../src/hooks/useProtectedRoute'
import { useAuth } from '../../src/providers/AuthProvider'

export default function Home() {
  useProtectedRoute()

  const { session } = useAuth()

  const [favorites, setFavorites] =
    useState<any[]>([])

  const [properties, setProperties] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [search, setSearch] =
    useState('')

  const categories = [
    'Összes',
    'Villa',
    'Tengerpart',
    'Modern',
    'Luxus',
    'Penthouse',
  ]

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('Összes')

  async function handleLogout() {
    try {
      await supabase.auth.signOut()

      router.replace('/welcome')
    } catch (error) {
      console.log(error)
    }
  }

  async function loadProperties() {
    try {
      setLoading(true)

      const { data, error } =
        await supabase
          .from('properties')
          .select('*')
          .order('id', {
            ascending: false,
          })

      if (error) {
        console.log(error)
        return
      }

      if (data) {
        setProperties(data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  async function loadFavorites() {
    try {
      if (!session?.user) return

      const { data } =
        await supabase
          .from('favorites')
          .select('*')
          .eq(
            'user_id',
            session.user.id
          )

      if (data) {
        setFavorites(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadFavorites()
      loadProperties()
    }, [session])
  )

  const filteredProperties =
    useMemo(() => {
      return properties.filter(
        (property) => {
          const matchesSearch =
            property.title
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            property.location
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )

          const matchesCategory =
            selectedCategory ===
              'Összes' ||
            property.category ===
              selectedCategory

          return (
            matchesSearch &&
            matchesCategory
          )
        }
      )
    }, [
      properties,
      search,
      selectedCategory,
    ])

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#0B0B0F',
      }}
      contentContainerStyle={{
        paddingTop: 110,
        paddingHorizontal: 24,
        paddingBottom: 180,
        gap: 34,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      <HomeHeader
        email={session?.user.email}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
      />

      <CategoryTabs
        categories={categories}
        selectedCategory={
          selectedCategory
        }
        onSelect={
          setSelectedCategory
        }
      />

      {/* PROPERTIES */}
      <View
        style={{
          gap: 8,
        }}
      >
        {loading ? (
          <>
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </>
        ) : (
          filteredProperties.map(
            (
              property,
              index
            ) => (
              <Animated.View
                key={property.id}
                entering={FadeInDown.delay(
                  300 +
                    index * 140
                ).springify()}
              >
                <PropertyCard
                  id={String(
                    property.id
                  )}
                  title={
                    property.title
                  }
                  price={
                    property.price
                  }
                  location={
                    property.location
                  }
                  images={
                    property.gallery
                      ?.length
                      ? property.gallery
                      : [
                          property.image,
                        ]
                  }
                />
              </Animated.View>
            )
          )
        )}
      </View>

      {/* FAVORITES */}
      <Animated.View
        entering={FadeInDown.delay(
          900
        ).springify()}
        style={{
          gap: 16,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 26,
            fontWeight: '800',
            letterSpacing: -1,
          }}
        >
          Kedvencek
        </Text>

        {favorites.length === 0 ? (
          <View
            style={{
              backgroundColor:
                'rgba(255,255,255,0.04)',

              borderRadius: 24,

              padding: 24,

              borderWidth: 1,

              borderColor:
                'rgba(255,255,255,0.06)',
            }}
          >
            <Text
              style={{
                color: '#71717A',

                fontSize: 16,

                lineHeight: 24,
              }}
            >
              Még nincs mentett
              ingatlanod.
            </Text>
          </View>
        ) : (
          favorites.map(
            (favorite) => (
              <View
                key={favorite.id}
                style={{
                  backgroundColor:
                    'rgba(255,255,255,0.04)',

                  padding: 20,

                  borderRadius: 24,

                  borderWidth: 1,

                  borderColor:
                    'rgba(255,255,255,0.06)',
                }}
              >
                <Text
                  style={{
                    color: 'white',

                    fontSize: 16,

                    fontWeight:
                      '600',
                  }}
                >
                  ❤️{' '}
                  {
                    favorite.property_id
                  }
                </Text>
              </View>
            )
          )
        )}
      </Animated.View>

      {/* LOGOUT */}
      <Animated.View
        entering={FadeInDown.delay(
          1050
        ).springify()}
      >
        <Pressable
          onPress={handleLogout}
          style={{
            backgroundColor:
              'rgba(255,255,255,0.06)',

            borderRadius: 24,

            paddingVertical: 20,

            alignItems: 'center',

            borderWidth: 1,

            borderColor:
              'rgba(255,255,255,0.08)',
          }}
        >
          <Text
            style={{
              color: 'white',

              fontSize: 16,

              fontWeight: '700',
            }}
          >
            Kijelentkezés
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  )
}