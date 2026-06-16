import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
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

import { Image } from 'expo-image'

import CategoryTabs from '@/components/home/CategoryTabs'
import SearchBar from '@/components/home/SearchBar'

import PropertyCard from '@/components/PropertyCard'
import PropertyCardSkeleton from '@/components/PropertyCardSkeleton'

import { supabase } from '../../src/services/supabase'

import { useProtectedRoute } from '../../src/hooks/useProtectedRoute'

import { useAuth } from '../../src/providers/AuthProvider'

import {
  Colors,
  Radius,
  Shadows,
} from '@/constants/theme'

import { hu } from '@/constants/translations'

export default function Home() {
  useProtectedRoute()

  const { session } = useAuth()
  const { width } = useWindowDimensions()

  const isMobile = width < 768

  const [favorites, setFavorites] =
    useState<any[]>([])

  const [properties, setProperties] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [search, setSearch] =
    useState('')

  const categories = [
    hu.categories.all,
    hu.categories.apartments,
    hu.categories.houses,
    hu.categories.villas,
    hu.categories.penthouses,
    hu.categories.newBuild,
  ]

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    hu.categories.all
  )

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
              hu.categories.all ||
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


const favoriteProperties =
  useMemo(() => {
    const favoriteIds =
      favorites.map(
        fav => fav.property_id
      )

    return properties.filter(
      property =>
        favoriteIds.includes(
          property.id
        )
    )
  }, [favorites, properties])

return (

 
    <View
      style={{
        flex: 1,
        backgroundColor:
          Colors.dark.background,
      }}
    >
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
            height:
              Platform.OS === 'web'
                ? 820
                : 620,

            borderBottomLeftRadius:
              Radius.xl,

            borderBottomRightRadius:
              Radius.xl,

            overflow: 'hidden',
          }}
        >
          <Image
            
  source={require('../../assets/images/luxury-placeholder.png')}
  contentFit="cover"
  style={{
    width: '100%',
    height: '100%',
  }}
/>
         

          <View
            style={{
              position: 'absolute',

              width: '100%',
              height: '100%',

              backgroundColor:
                'rgba(0,0,0,0.58)',
            }}
          />

          <View
            style={{
              position: 'absolute',

              width: '100%',
              height: '100%',

              justifyContent: 'center',

              paddingTop:
                Platform.OS === 'web'
                  ? 0
                  : 40,

              paddingHorizontal: 24,
            }}
          >
            <View
  style={{
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
  }}
>
  <Animated.View
    entering={FadeInDown.springify()}
  >
    <Text
      style={{
        color: 'white',
        fontSize: isMobile ? 36 : 80,
        lineHeight: isMobile ? 42 : 86,
        fontWeight: '900',
        letterSpacing: -4,
        maxWidth: 760,
      }}
    >
      {hu.home.heroTitle}
    </Text>

    <Text
      style={{
        color: '#D1D5DB',
        fontSize: isMobile ? 18 : 22,
        marginTop: 28,
        maxWidth: 560,
        lineHeight: 34,
      }}
    >
      {hu.home.heroSubtitle}
    </Text>
  </Animated.View>

  
              <Animated.View
                entering={FadeInDown.delay(
                  250
                ).springify()}
                style={{
                  marginTop: 42,
                  maxWidth: 520,
                }}
              >
                <SearchBar
                  value={search}
                  onChange={setSearch}
                />
              </Animated.View>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        <View
          style={{
            width: '100%',
            maxWidth: 1440,
            alignSelf: 'center',

            paddingHorizontal: 24,

            marginTop: 42,
          }}
        >
          <CategoryTabs
            categories={categories}
            selectedCategory={
              selectedCategory
            }
            onSelect={
              setSelectedCategory
            }
          />

          {/* SECTION HEADER */}
          <View
            style={{
              marginTop: 42,
              marginBottom: 28,

              flexDirection: 'row',

              justifyContent:
                'space-between',

              alignItems: 'center',
            }}
          >
            <View>
              <Text
                style={{
                  color: 'white',

                  fontSize: 42,

                  fontWeight: '900',

                  letterSpacing: -2,
                }}
              >
                {
                  hu.home
                    .luxuryProperties
                }
              </Text>

              <Text
                style={{
                  color:
                    Colors.dark.muted,

                  marginTop: 8,

                  fontSize: 16,
                }}
              >
                {hu.home.handpicked}
              </Text>
            </View>

            <Text
              style={{
                color:
                  Colors.dark.primary,

                fontSize: 16,

                fontWeight: '700',
              }}
            >
              {
                filteredProperties.length
              }{' '}
              ingatlan
            </Text>
          </View>

          {/* GRID */}
          <View
            style={{
              flexDirection: 'row',

              flexWrap: 'wrap',

              justifyContent:
                'space-between',

              rowGap: 28,
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
                        index * 120
                    ).springify()}
                    style={{
                      width:
                        Platform.OS ===
                        'web'
                          ? 400
                          : '100%',
                    }}
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
          <View
            style={{
              marginTop: 72,
            }}
          >
            <Text
              style={{
                color: 'white',

                fontSize: 38,

                fontWeight: '900',

                letterSpacing: -2,

                marginBottom: 24,
              }}
            >
              {hu.home.favorites}
            </Text>

            {favorites.length ===
            0 ? (
              <View
                style={{
                  backgroundColor:
                    Colors.dark.surface,

                  borderRadius:
                    Radius.lg,

                  padding: 32,

                  borderWidth: 1,

                  borderColor:
                    Colors.dark.border,
                }}
              >
                <Text
                  style={{
                    color:
                      Colors.dark.muted,

                    fontSize: 17,

                    lineHeight: 28,
                  }}
                >
                  {
                    hu.favorites
                      .empty
                  }
                </Text>
              </View>
            ) : (
              favorites.map(
                (favorite) => (
                  <View
  style={{
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  }}
>
  {favoriteProperties.map(
    (property, index) => (
      <Animated.View
        key={property.id}
        entering={FadeInDown.delay(
          200 + index * 100
        ).springify()}
        style={{
          width:
            Platform.OS === 'web'
              ? 400
              : '100%',
        }}
      >
        <PropertyCard
          id={property.id}
          title={property.title}
          price={property.price}
          location={property.location}
          images={
            property.gallery?.length
              ? property.gallery
              : [property.image]
          }
        />
      </Animated.View>
    )
  )}
</View>
                  
                )
              )
            )}
          </View>

          {/* LOGOUT */}
          <Pressable
            onPress={handleLogout}
            style={{
              marginTop: 72,

              backgroundColor:
                Colors.dark.surface,

              borderRadius:
                Radius.full,

              paddingVertical: 22,

              alignItems: 'center',

              borderWidth: 1,

              borderColor:
                Colors.dark.border,

              ...Shadows.luxury,
            }}
          >
            <Text
              style={{
                color: 'white',

                fontSize: 17,

                fontWeight: '800',
              }}
            >
              {hu.home.logout}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* FLOATING UPLOAD BUTTON */}
      <Pressable
        onPress={() =>
          router.push('/upload')
        }
        style={{
          position: 'absolute',

          right: 28,
          bottom: 34,

          backgroundColor:
            Colors.dark.primary,

          paddingHorizontal: 28,
          paddingVertical: 18,

          borderRadius: Radius.full,

          borderWidth: 1,

          borderColor:
            'rgba(255,255,255,0.08)',

          ...Shadows.luxury,
        }}
      >
        <Text
          style={{
            color: '#000',

            fontSize: 15,

            fontWeight: '900',
          }}
        >
          + Új ingatlan
        </Text>
      </Pressable>
    </View>
  )
}