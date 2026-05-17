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
  useState,
} from 'react'

import { useFocusEffect } from 'expo-router'

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
        paddingBottom: 140,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#D6B98C"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Kedvencek
        </Text>

        <Text style={styles.subtitle}>
          {favorites.length} mentett ingatlan
        </Text>
      </View>

      {favorites.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>
            🖤
          </Text>

          <Text style={styles.emptyTitle}>
            Még nincs kedvenc ingatlanod
          </Text>

          <Text style={styles.emptyText}>
            Jelöld meg a kedvenc
            ingatlanokat a szív ikonnal,
            és itt automatikusan
            megjelennek.
          </Text>
        </View>
      )}

      {favorites.map((property) => (
        <View
          key={property.id}
          style={styles.cardWrapper}
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
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060A',
    paddingHorizontal: 20,
  },

  loader: {
    flex: 1,
    backgroundColor: '#05060A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    marginTop: 68,
    marginBottom: 34,
  },

  title: {
    color: 'white',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.5,
  },

  subtitle: {
    color: '#8F939D',
    fontSize: 16,
    marginTop: 8,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 24,
  },

  emptyEmoji: {
    fontSize: 52,
    marginBottom: 20,
  },

  emptyTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },

  emptyText: {
    color: '#8F939D',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 28,
  },

  cardWrapper: {
    marginBottom: 20,
  },
})