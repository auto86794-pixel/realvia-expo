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

import { useAuth } from '../../src/providers/AuthProvider'

import {
  Colors,
  Radius,
  Shadows,
} from '@/constants/theme'

import { hu } from '@/constants/translations'

export default function Home() {
  const { session } = useAuth()
  const { width } = useWindowDimensions()

  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1180
  const pagePadding = isMobile ? 16 : 32
  const cardWidth = isMobile
    ? '100%'
    : isTablet
      ? '48.5%'
      : '31.5%'

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
          .in('status', ['published', 'sold'])
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
        backgroundColor: '#F4F1EB',
      }}
    >
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: '#F4F1EB',
        }}
        contentContainerStyle={{
          paddingBottom: 180,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HERO */}
        <View
  style={{
    height: isMobile ? 520 : 680,

    borderBottomLeftRadius:
      Radius.xl,

    borderBottomRightRadius:
      Radius.xl,

    overflow: 'hidden',
  }}
>
        
          <Image
            
  source={require('../../assets/images/realvia-home-sunrise.png')}
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

              backgroundColor: 'rgba(25,38,31,0.34)',
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

              paddingHorizontal: pagePadding,
            }}
          >
            <View
  style={{
   width: '100%',
    maxWidth: isMobile ? '100%' : 1440,
    alignSelf: 'center',
  }}
>
  <Animated.View
    entering={FadeInDown.springify()}
  >
    <Text
      style={{
        color: 'white',
        fontSize: isMobile ? 42 : 72,
        lineHeight: isMobile ? 47 : 78,
        fontWeight: '900',
        letterSpacing: isMobile ? -2 : -4,
        maxWidth: isMobile ? '100%' : 760,
      }}
    >
      {hu.home.heroTitle}
    </Text>

    <Text
      style={{
        color: '#D1D5DB',
        fontSize: isMobile ? 16 : 22,
        marginTop: isMobile ? 18 : 28,
        maxWidth: 560,
        lineHeight: isMobile ? 24 : 34,
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
                  marginTop: isMobile ? 28 : 42,
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
    marginTop: isMobile ? 28 : 42,
    paddingHorizontal: pagePadding,
  }}
>
  <View
    style={{
      maxWidth: '100%',
      overflow: 'hidden',
    }}
  >

      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
        </View>

          {/* SECTION HEADER */}
          <View
            style={{
              marginTop: 42,
              marginBottom: 28,

              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,

              justifyContent:
                'space-between',

              alignItems: isMobile
                ? 'flex-start'
                : 'center',
            }}
          >
            <View>
              <Text
                style={{
                  color: '#1D2923',

                  fontSize: isMobile
                    ? 30
                    : 42,

                  fontWeight: '900',

                  letterSpacing: isMobile
                    ? -1
                    : -2,
                }}
              >
                {
                  hu.home
                    .luxuryProperties
                }
              </Text>

              <Text
                style={{
                  color: '#6E7872',

                  marginTop: 8,

                  fontSize: 16,
                }}
              >
                {hu.home.handpicked}
              </Text>
            </View>

            <Text
              style={{
                  color: '#8B6338',

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
              columnGap: '2%',
            }}
          >
            {loading ? (
              <>
                {[0, 1, 2].map((item) => (
                  <View
                    key={item}
                    style={{ width: cardWidth }}
                  >
                    <PropertyCardSkeleton />
                  </View>
                ))}
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
                      width: cardWidth,
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
                      status={property.status}
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
          {/* FAVORITES */}
<View
  style={{
    marginTop: 72,
  }}
>
  <Text
    style={{
      color: '#1D2923',
      fontSize: 38,
      lineHeight: isMobile ? 38 : 46,
      fontWeight: '900',
      letterSpacing: -2,
      marginBottom: 24,
    }}
  >
    {hu.home.favorites}
  </Text>

  {favoriteProperties.length === 0 ? (
    <View
      style={{
        backgroundColor: '#FFFDFC',
        borderRadius: Radius.lg,
        padding: 32,
        borderWidth: 1,
        borderColor: '#E3DED5',
      }}
    >
      <Text
        style={{
          color: '#66716A',
          fontSize: 17,
          lineHeight: 28,
        }}
      >
        {hu.favorites.empty}
      </Text>
    </View>
  ) : (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      {favoriteProperties.map((property, index) => (
        <Animated.View
          key={property.id}
          entering={FadeInDown.delay(
            200 + index * 100
          ).springify()}
          style={{
            width: cardWidth,
            maxWidth: '100%',
          }}
        >
          <PropertyCard
            id={String(property.id)}
            title={property.title}
            price={property.price}
            location={property.location}
            status={property.status}
            images={
              property.gallery?.length
                ? property.gallery
                : [property.image]
            }
          />
        </Animated.View>
      ))}
    </View>
  )}
</View>
              
              
            
        

          {/* LOGOUT */}
          <Pressable
            onPress={handleLogout}
            style={{
              marginTop: 72,

              backgroundColor: '#FFFDFC',

              borderRadius:
                Radius.full,

              paddingVertical: 22,

              alignItems: 'center',

              borderWidth: 1,

              borderColor: '#D9D4CC',

              ...Shadows.luxury,
            }}
          >
            <Text
              style={{
                color: '#455149',

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

          right: isMobile ? 16 : 28,
          bottom: isMobile ? 108 : 34,

          backgroundColor: '#2E4639',

          paddingHorizontal: isMobile ? 20 : 28,
          paddingVertical: isMobile ? 15 : 18,

          borderRadius: Radius.full,

          borderWidth: 1,

          borderColor:
            'rgba(255,255,255,0.08)',

          ...Shadows.luxury,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',

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
