import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Bath, BedDouble, Car, ChevronLeft, ChevronRight, Heart, MapPin, Maximize, Pencil, Share2, Trash2 } from 'lucide-react-native'

import InquiryModal from '@/components/InquiryModal'
import { supabase } from '@/src/services/supabase'
import { useAuth } from '@/src/providers/AuthProvider'
import { deletePropertyWithImages } from '@/src/services/blob'

type Property = {
  id: number
  owner_id?: string
  title: string
  image?: string
  gallery?: string[] | string
  location: string
  price: string | number
  description?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  parking?: number
  category?: string
  listing_type?: string
  status?: string
}

export default function PropertyDetail() {
  const { id } = useLocalSearchParams()
  const { session } = useAuth()
  const { width } = useWindowDimensions()
  const desktop = width >= 900
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorite, setFavorite] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [inquiryOpen, setInquiryOpen] = useState(false)

  const images = useMemo(() => {
    if (!property) return []
    if (Array.isArray(property.gallery) && property.gallery.length) return property.gallery
    if (typeof property.gallery === 'string') {
      try {
        const parsed = JSON.parse(property.gallery)
        if (Array.isArray(parsed) && parsed.length) return parsed
      } catch {}
    }
    return property.image ? [property.image] : []
  }, [property])

  const ownProperty = !!session?.user?.id && property?.owner_id === session.user.id
  const sold = property?.status === 'sold'

  function previousImage() {
    setActiveImage((current) =>
      current === 0
        ? images.length - 1
        : current - 1
    )
  }

  function nextImage() {
    setActiveImage((current) =>
      current === images.length - 1
        ? 0
        : current + 1
    )
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('properties').select('*').eq('id', id).single()
        if (error) throw error
        setProperty(data as Property)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    async function check() {
      if (!session?.user?.id || !property?.id) return
      const { data } = await supabase.from('favorites').select('id').eq('user_id', session.user.id).eq('property_id', property.id).maybeSingle()
      setFavorite(!!data)
    }
    check()
  }, [property?.id, session?.user?.id])

  async function toggleFavorite() {
    if (!session?.user?.id || !property) {
      Alert.alert('Belépés szükséges', 'A mentéshez előbb jelentkezz be.')
      return
    }
    if (favorite) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('property_id', property.id)
      setFavorite(false)
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: session.user.id, property_id: property.id })
      if (!error) setFavorite(true)
    }
  }

  async function removeProperty() {
    if (!property || !ownProperty) return
    const remove = async () => {
      try {
        await deletePropertyWithImages(property.id)
      } catch {
        return Alert.alert('Hiba', 'A hirdetést és a képeit nem sikerült törölni.')
      }
      router.replace('/dashboard')
    }
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Biztosan törlöd ezt a hirdetést?')) await remove()
    } else {
      Alert.alert('Hirdetés törlése', 'Ez a művelet nem vonható vissza.', [
        { text: 'Mégse', style: 'cancel' },
        { text: 'Törlés', style: 'destructive', onPress: remove },
      ])
    }
  }

  async function share() {
    const url = Platform.OS === 'web' ? globalThis.location?.href : `https://www.realvia.hu/property/${id}`
    if (url) await Linking.openURL(`mailto:?subject=${encodeURIComponent(property?.title || 'Realvia ingatlan')}&body=${encodeURIComponent(url)}`)
  }

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#8B6338" /><Text style={styles.loadingText}>Ingatlan betöltése…</Text></View>
  if (!property) return <View style={styles.loading}><Text style={styles.notFound}>Az ingatlan nem található.</Text><Pressable onPress={() => router.replace('/')}><Text style={styles.backLink}>Vissza a főoldalra</Text></Pressable></View>

  return (
    <>
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <View style={styles.shell}>
          <View style={styles.topbar}>
            <Pressable onPress={() => router.back()} style={styles.roundButton}><ArrowLeft size={20} color="#334139" /></Pressable>
            <View style={styles.topActions}>
              <Pressable onPress={share} style={styles.roundButton}><Share2 size={19} color="#334139" /></Pressable>
              <Pressable onPress={toggleFavorite} style={[styles.roundButton, favorite && styles.favoriteButton]}><Heart size={19} color={favorite ? '#fff' : '#334139'} fill={favorite ? '#fff' : 'transparent'} /></Pressable>
            </View>
          </View>

          <View style={[styles.heroGrid, desktop && styles.heroGridDesktop]}>
            <View style={[styles.heroMain, desktop && styles.heroMainDesktop]}>
              {images[activeImage] ? <Image source={{ uri: images[activeImage] }} contentFit="cover" style={styles.heroImage} /> : <View style={[styles.heroImage, styles.placeholder]} />}
              <View style={[styles.heroBadge, sold && styles.soldBadge]}><Text style={[styles.heroBadgeText, sold && styles.soldBadgeText]}>{sold ? 'ELADVA' : (property.listing_type || 'Eladó').toUpperCase()}</Text></View>
              {images.length > 1 && (
                <View style={styles.galleryArrows}>
                  <Pressable onPress={previousImage} style={styles.galleryArrow}>
                    <ChevronLeft size={23} color="#24332B" />
                  </Pressable>
                  <Text style={styles.imageCounter}>{activeImage + 1} / {images.length}</Text>
                  <Pressable onPress={nextImage} style={styles.galleryArrow}>
                    <ChevronRight size={23} color="#24332B" />
                  </Pressable>
                </View>
              )}
            </View>
            {desktop && images.length > 1 && <View style={styles.sideImages}>{images.slice(1, 3).map((uri, i) => <Pressable key={uri} style={styles.sideImageWrap} onPress={() => setActiveImage(i + 1)}><Image source={{ uri }} contentFit="cover" style={styles.sideImage} /></Pressable>)}</View>}
          </View>

          {images.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>{images.map((uri, i) => <Pressable key={`${uri}-${i}`} onPress={() => setActiveImage(i)} style={[styles.thumbWrap, activeImage === i && styles.thumbActive]}><Image source={{ uri }} contentFit="cover" style={styles.thumb} /></Pressable>)}</ScrollView>}

          <View style={[styles.contentGrid, desktop && styles.contentGridDesktop]}>
            <View style={styles.mainContent}>
              <Text style={styles.eyebrow}>{property.category || 'Ingatlan'}</Text>
              <Text style={[styles.title, !desktop && styles.titleMobile]}>{property.title}</Text>
              <View style={styles.locationRow}><MapPin size={17} color="#8B6338" /><Text style={styles.location}>{property.location}</Text></View>
              <Text style={styles.price}>{Number(property.price).toLocaleString('hu-HU')} Ft</Text>

              <View style={styles.stats}>
                <Stat icon={<BedDouble size={21} color="#6B7B71" />} value={property.bedrooms || 0} label="Szoba" />
                <Stat icon={<Bath size={21} color="#6B7B71" />} value={property.bathrooms || 0} label="Fürdő" />
                <Stat icon={<Maximize size={21} color="#6B7B71" />} value={`${property.area || 0} m²`} label="Alapterület" />
                <Stat icon={<Car size={21} color="#6B7B71" />} value={property.parking || 0} label="Parkoló" />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Az ingatlanról</Text>
                <Text style={styles.description}>{property.description || 'A hirdető még nem adott meg részletes leírást.'}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Elhelyezkedés</Text>
                <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`)} style={styles.mapCard}>
                  <View style={styles.mapIcon}><MapPin size={24} color="#fff" /></View>
                  <View style={{ flex: 1 }}><Text style={styles.mapTitle}>{property.location}</Text><Text style={styles.mapText}>Megnyitás a térképen →</Text></View>
                </Pressable>
              </View>
            </View>

            <View style={[styles.contactCard, desktop && styles.contactCardDesktop]}>
              <Text style={styles.contactEyebrow}>{ownProperty ? 'TULAJDONOSI NÉZET' : sold ? 'EZ AZ INGATLAN ELKELT' : 'ÉRDEKEL AZ INGATLAN?'}</Text>
              <Text style={styles.contactTitle}>{ownProperty ? 'Saját hirdetésed' : sold ? 'Sikeresen értékesítve' : 'Egyeztess megtekintést'}</Text>
              <Text style={styles.contactText}>{ownProperty ? 'Itt szerkesztheted vagy törölheted a hirdetést. A beérkezett megkereséseket az Érdeklődések oldalon kezelheted.' : sold ? 'Ez a hirdetés referenciaértékkel továbbra is megtekinthető. Hasonló ingatlan iránt továbbra is jelezheted az érdeklődésed.' : 'Kérj visszahívást, további információt vagy adj meg számodra megfelelő megtekintési időpontokat.'}</Text>
              {!ownProperty && <Pressable onPress={() => setInquiryOpen(true)} style={styles.contactButton}><Text style={styles.contactButtonText}>{sold ? 'Hasonló ingatlant keresek' : 'Megtekintés vagy érdeklődés'}</Text></Pressable>}
              {ownProperty && <>
                <View style={styles.ownerDivider} />
                <Pressable onPress={() => router.push(`/property/edit/${property.id}`)} style={styles.editButton}><Pencil size={17} color="#455149" /><Text style={styles.editText}>Szerkesztés</Text></Pressable>
                <Pressable onPress={removeProperty} style={styles.deleteButton}><Trash2 size={17} color="#A64D49" /><Text style={styles.deleteText}>Hirdetés törlése</Text></Pressable>
              </>}
            </View>
          </View>
        </View>
      </ScrollView>
      <InquiryModal visible={inquiryOpen} onClose={() => setInquiryOpen(false)} propertyId={property.id} propertyTitle={property.title} propertyOwnerId={property.owner_id} soldProperty={sold} />
    </>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return <View style={styles.stat}>{icon}<Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F1EB' },
  pageContent: { paddingHorizontal: 18, paddingTop: Platform.OS === 'web' ? 26 : 60, paddingBottom: 120 },
  shell: { width: '100%', maxWidth: 1240, alignSelf: 'center' },
  loading: { flex: 1, backgroundColor: '#F4F1EB', alignItems: 'center', justifyContent: 'center', gap: 15 },
  loadingText: { color: '#68736C', fontSize: 16 },
  notFound: { color: '#1D2923', fontSize: 25, fontWeight: '800' },
  backLink: { color: '#8B6338', fontWeight: '800' },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  topActions: { flexDirection: 'row', gap: 9 },
  roundButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E0DBD3', alignItems: 'center', justifyContent: 'center' },
  favoriteButton: { backgroundColor: '#2E4639', borderColor: '#2E4639' },
  heroGrid: { gap: 10 },
  heroGridDesktop: { flexDirection: 'row', height: 570 },
  heroMain: { width: '100%', height: 360, borderRadius: 25, overflow: 'hidden', backgroundColor: '#E7E1D7' },
  heroMainDesktop: { flex: 2, height: '100%' },
  heroImage: { width: '100%', height: '100%' },
  placeholder: { backgroundColor: '#E7E1D7' },
  heroBadge: { position: 'absolute', left: 18, top: 18, backgroundColor: '#F8F0E4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 },
  heroBadgeText: { color: '#79542F', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  soldBadge: { backgroundColor: '#C73E3A' },
  soldBadgeText: { color: '#FFFFFF' },
  galleryArrows: { position: 'absolute', left: 18, right: 18, bottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  galleryArrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,253,249,0.92)', alignItems: 'center', justifyContent: 'center' },
  imageCounter: { color: '#FFFFFF', backgroundColor: 'rgba(29,41,35,0.72)', paddingHorizontal: 13, paddingVertical: 7, borderRadius: 99, fontSize: 12, fontWeight: '800' },
  sideImages: { flex: 1, gap: 10 },
  sideImageWrap: { flex: 1, borderRadius: 22, overflow: 'hidden' },
  sideImage: { width: '100%', height: '100%' },
  thumbs: { gap: 9, paddingVertical: 12 },
  thumbWrap: { width: 88, height: 64, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: '#8B6338' },
  thumb: { width: '100%', height: '100%' },
  contentGrid: { gap: 28, marginTop: 28 },
  contentGridDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  mainContent: { flex: 1 },
  eyebrow: { color: '#9B7141', fontSize: 12, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { color: '#1D2923', fontSize: Platform.OS === 'web' ? 46 : 35, lineHeight: Platform.OS === 'web' ? 53 : 42, fontWeight: '800', letterSpacing: -1.5, marginTop: 9 },
  titleMobile: { fontSize: 30, lineHeight: 36, letterSpacing: -0.8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13 },
  location: { color: '#69746D', fontSize: 16 },
  price: { color: '#2E4639', fontSize: 30, fontWeight: '800', marginTop: 21 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 28, backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 19, paddingVertical: 20 },
  stat: { flex: 1, minWidth: 110, alignItems: 'center', gap: 5 },
  statValue: { color: '#27342D', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#858C87', fontSize: 12 },
  section: { marginTop: 36 },
  sectionTitle: { color: '#1D2923', fontSize: 25, fontWeight: '800', marginBottom: 14 },
  description: { color: '#626E67', fontSize: 17, lineHeight: 30 },
  mapCard: { backgroundColor: '#E7EDE8', borderRadius: 18, padding: 20, flexDirection: 'row', gap: 15, alignItems: 'center' },
  mapIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#486052', alignItems: 'center', justifyContent: 'center' },
  mapTitle: { color: '#2A3931', fontWeight: '800', fontSize: 17 },
  mapText: { color: '#758078', marginTop: 5 },
  contactCard: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 22, padding: 24 },
  contactCardDesktop: { width: 350, position: 'sticky' as any, top: 24 },
  contactEyebrow: { color: '#9B7141', fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  contactTitle: { color: '#1D2923', fontSize: 24, lineHeight: 30, fontWeight: '800', marginTop: 10 },
  contactText: { color: '#6B756F', lineHeight: 23, marginTop: 11 },
  contactButton: { backgroundColor: '#2E4639', minHeight: 55, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  contactButtonText: { color: '#fff', fontWeight: '800' },
  ownerDivider: { height: 1, backgroundColor: '#E5E0D9', marginVertical: 20 },
  ownerLabel: { color: '#7A837D', fontSize: 12, fontWeight: '700', marginBottom: 10 },
  editButton: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#CFC9C0', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  editText: { color: '#455149', fontWeight: '800' },
  deleteButton: { minHeight: 44, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', marginTop: 7 },
  deleteText: { color: '#A64D49', fontWeight: '700', fontSize: 13 },
})
