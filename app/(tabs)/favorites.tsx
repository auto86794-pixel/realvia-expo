import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  BlurView,
} from 'expo-blur'

import {
  LinearGradient,
} from 'expo-linear-gradient'

import {
  useFocusEffect,
} from 'expo-router'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import PropertyCard from '@/components/PropertyCard'

import { supabase } from '@/src/services/supabase'

export default function FavoritesScreen() {
  const [favorites, setFavorites] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  async function loadFavorites(
    showLoader = true
  ) {
    try {
      if (showLoader) {
        setLoading(true)
      }

      const {
        data: favoriteRows,
        error: favoritesError,
      } = await supabase
        .from('favorites')
        .select('property_id')

      if (favoritesError) {
        console.log(favoritesError)
        return
      }

      if (
        !favoriteRows ||
        favoriteRows.length === 0
      ) {
        setFavorites([])
        return
      }

      const ids = favoriteRows.map(
        (item) => item.property_id
      )

      const {
        data: properties,
        error: propertiesError,
      } = await supabase
        .from('properties')
        .select('*')
        .in('id', ids)

      if (propertiesError) {
        console.log(propertiesError)
        return
      }

      const sorted =
        properties?.sort(
          (a, b) =>
            ids.indexOf(a.id) -
            ids.indexOf(b.id)
        ) || []

      setFavorites(sorted)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadFavorites(false)
    }, [])
  )

  async function onRefresh() {
    setRefreshing(true)
    await loadFavorites(false)
  }

  const totalValue = useMemo(() => {
    return favorites.length
  }, [favorites])

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#D6B98C"
        />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 180,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#D6B98C"
        />
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HERO */}
      <LinearGradient
        colors={[
          '#10131A',
          '#05060A',
        ]}
        style={styles.hero}
      >
        <Animated.View
          entering={FadeInDown.springify()}
        >
          <Text style={styles.title}>
            Kedvencek
          </Text>

          <Text
            style={styles.subtitle}
          >
            Saját luxury collection
          </Text>
        </Animated.View>

        {/* STATS */}
        <Animated.View
          entering={FadeInDown.delay(
            120
          ).springify()}
        >
          <BlurView
            intensity={50}
            tint="dark"
            style={styles.statsCard}
          >
            <View>
              <Text
                style={
                  styles.statsLabel
                }
              >
                Mentett
              </Text>

              <Text
                style={
                  styles.statsValue
                }
              >
                {totalValue}
              </Text>
            </View>

            <View
              style={
                styles.divider
              }
            />

            <View>
              <Text
                style={
                  styles.statsLabel
                }
              >
                Státusz
              </Text>

              <Text
                style={
                  styles.statsValueSmall
                }
              >
                Premium
              </Text>
            </View>
          </BlurView>
        </Animated.View>
      </LinearGradient>

      {/* EMPTY */}
      {favorites.length === 0 && (
        <Animated.View
          entering={FadeInDown.delay(
            200
          ).springify()}
          style={styles.emptyWrapper}
        >
          <BlurView
            intensity={45}
            tint="dark"
            style={styles.emptyCard}
          >
            <Text
              style={
                styles.emptyEmoji
              }
            >
              🖤
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Luxury collection üres
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Mentsd el a kedvenc
              ingatlanokat és itt
              jelennek meg a saját
              prémium válogatásaid.
            </Text>
          </BlurView>
        </Animated.View>
      )}

      {/* LIST */}
      <View
        style={{
          marginTop: 10,
        }}
      >
        {favorites.map(
          (property, index) => (
            <Animated.View
              key={property.id}
              entering={FadeInDown.delay(
                220 +
                  index * 120
              ).springify()}
              style={
                styles.cardWrapper
              }
            >
              <PropertyCard
                id={property.id}
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
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060A',
  },

  loader: {
    flex: 1,
    backgroundColor: '#05060A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  hero: {
    paddingTop: 90,
    paddingHorizontal: 24,
    paddingBottom: 38,
  },

  title: {
    color: 'white',
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: -2,
  },

  subtitle: {
    color: '#8F939D',
    fontSize: 17,
    marginTop: 10,
  },

  statsCard: {
    marginTop: 28,
    borderRadius: 30,
    overflow: 'hidden',

    padding: 24,

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.06)',

    backgroundColor:
      'rgba(255,255,255,0.04)',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  statsLabel: {
    color: '#71717A',
    fontSize: 14,
    marginBottom: 10,
  },

  statsValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },

  statsValueSmall: {
    color: '#D6B98C',
    fontSize: 22,
    fontWeight: '800',
  },

  divider: {
    width: 1,
    height: 48,
    backgroundColor:
      'rgba(255,255,255,0.08)',
  },

  emptyWrapper: {
    paddingHorizontal: 24,
    marginTop: 30,
  },

  emptyCard: {
    borderRadius: 34,
    overflow: 'hidden',

    paddingVertical: 50,
    paddingHorizontal: 28,

    alignItems: 'center',

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.06)',

    backgroundColor:
      'rgba(255,255,255,0.04)',
  },

  emptyEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },

  emptyTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },

  emptyText: {
    color: '#8F939D',
    fontSize: 16,
    lineHeight: 30,
    textAlign: 'center',
  },

  cardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
})