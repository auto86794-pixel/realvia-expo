import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { router, useFocusEffect } from 'expo-router'
import { Building2, Eye, FilePenLine, HardDrive, MessageSquare, Plus, Trash2, Users } from 'lucide-react-native'

import { supabase } from '@/src/services/supabase'
import { useAuth } from '@/src/providers/AuthProvider'
import { useProtectedRoute } from '@/src/hooks/useProtectedRoute'
import { deletePropertyWithImages, getBlobUsage } from '@/src/services/blob'

type Property = {
  id: string | number
  title: string
  location: string
  price: number | string
  image?: string
  status?: 'draft' | 'published' | 'inactive' | 'sold'
  created_at?: string
}

export default function Dashboard() {
  useProtectedRoute()
  const { session } = useAuth()
  const { width } = useWindowDimensions()
  const mobile = width < 760
  const [properties, setProperties] = useState<Property[]>([])
  const [unreadInquiries, setUnreadInquiries] = useState(0)
  const [loading, setLoading] = useState(true)
  const [storage, setStorage] = useState({ megabytes: 0, files: 0 })

  const loadProperties = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setProperties((data || []) as Property[])

      const { data: unreadData, error: unreadError } = await supabase
        .from('inquiries')
        .select('id')
        .eq('owner_id', session.user.id)
        .is('read_at', null)
      if (!unreadError) setUnreadInquiries((unreadData || []).length)

      try {
        setStorage(await getBlobUsage())
      } catch (storageError) {
        console.log('Blob usage unavailable:', storageError)
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Hiba', 'A saját hirdetéseid most nem tölthetők be.')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useFocusEffect(useCallback(() => { loadProperties() }, [loadProperties]))

  async function removeProperty(id: string | number) {
    const remove = async () => {
      try {
        await deletePropertyWithImages(id)
      } catch (error) {
        Alert.alert('Hiba', 'A hirdetést nem sikerült törölni.')
        return
      }
      setProperties((current) => current.filter((item) => item.id !== id))
      try {
        setStorage(await getBlobUsage())
      } catch {}
    }

    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Biztosan törlöd ezt a hirdetést?')) await remove()
      return
    }
    Alert.alert('Hirdetés törlése', 'Ez a művelet nem vonható vissza.', [
      { text: 'Mégse', style: 'cancel' },
      { text: 'Törlés', style: 'destructive', onPress: remove },
    ])
  }

  const published = properties.filter((item) => (item.status || 'published') === 'published').length
  const drafts = properties.filter((item) => item.status === 'draft').length

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.shell}>
        <View style={[styles.header, mobile && styles.headerMobile]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>SAJÁT FIÓK</Text>
            <Text style={styles.title}>Saját hirdetéseim</Text>
            <Text style={styles.subtitle}>Itt követheted, szerkesztheted és kezelheted az ingatlanjaidat.</Text>
          </View>
          <View style={[styles.headerActions, mobile && styles.headerActionsMobile]}>
            <Pressable onPress={() => router.push('/buyers' as any)} style={styles.inquiryButton}>
              <Users size={18} color="#2E4639" />
              <Text style={styles.inquiryButtonText}>Vevők és találatok</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/inquiries')} style={styles.inquiryButton}>
              <MessageSquare size={18} color="#2E4639" />
              <Text style={styles.inquiryButtonText}>Érdeklődések</Text>
              {unreadInquiries > 0 && <View style={styles.notificationBadge}><Text style={styles.notificationBadgeText}>{unreadInquiries > 99 ? '99+' : unreadInquiries}</Text></View>}
            </Pressable>
            <Pressable onPress={() => router.push('/upload')} style={styles.addButton}>
              <Plus size={19} color="#fff" />
              <Text style={styles.addButtonText}>Új hirdetés</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat icon={<Building2 size={20} color="#496052" />} label="Összes hirdetés" value={properties.length} />
          <Stat icon={<Eye size={20} color="#496052" />} label="Publikus" value={published} />
          <Stat icon={<FilePenLine size={20} color="#496052" />} label="Piszkozat" value={drafts} />
          <Stat icon={<HardDrive size={20} color="#496052" />} label={`${storage.files} tárolt kép`} value={`${storage.megabytes} MB / 1024 MB`} />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Ingatlanok</Text>
          <Text style={styles.listCount}>{properties.length} hirdetés</Text>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#8B6338" /></View>
        ) : properties.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Building2 size={32} color="#8B6338" /></View>
            <Text style={styles.emptyTitle}>Még nincs saját hirdetésed</Text>
            <Text style={styles.emptyText}>Hozd létre az első ingatlanhirdetésedet, és pár perc múlva már nyilvánosan is megjelenhet.</Text>
            <Pressable onPress={() => router.push('/upload')} style={styles.emptyButton}><Text style={styles.addButtonText}>Első hirdetés feladása</Text></Pressable>
          </View>
        ) : (
          <View style={styles.cards}>
            {properties.map((property) => (
              <View key={property.id} style={[styles.card, mobile && styles.cardMobile]}>
                {property.image ? (
                  <Image source={{ uri: property.image }} contentFit="cover" style={[styles.image, mobile && styles.imageMobile]} />
                ) : (
                  <View style={[styles.image, styles.imagePlaceholder, mobile && styles.imageMobile]}><Building2 size={30} color="#B79A77" /></View>
                )}
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Status status={property.status || 'published'} />
                    <Text style={styles.date}>{property.created_at ? new Date(property.created_at).toLocaleDateString('hu-HU') : ''}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{property.title}</Text>
                  <Text style={styles.location}>{property.location}</Text>
                  <Text style={styles.price}>{Number(property.price).toLocaleString('hu-HU')} Ft</Text>
                </View>
                <View style={[styles.actions, mobile && styles.actionsMobile]}>
                  <Pressable onPress={() => router.push(`/property/${property.id}`)} style={styles.iconButton}><Eye size={18} color="#455149" /></Pressable>
                  <Pressable onPress={() => router.push(`/property/edit/${property.id}`)} style={styles.editButton}><FilePenLine size={17} color="#fff" /><Text style={styles.editText}>Szerkesztés</Text></Pressable>
                  <Pressable onPress={() => removeProperty(property.id)} style={styles.iconButton}><Trash2 size={18} color="#A64D49" /></Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return <View style={styles.stat}><View style={styles.statIcon}>{icon}</View><View><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View></View>
}

function Status({ status }: { status: string }) {
  const draft = status === 'draft'
  const inactive = status === 'inactive'
  const sold = status === 'sold'
  return <View style={[styles.badge, draft && styles.badgeDraft, inactive && styles.badgeInactive, sold && styles.badgeSold]}><View style={[styles.dot, draft && styles.dotDraft, inactive && styles.dotInactive, sold && styles.dotSold]} /><Text style={[styles.badgeText, draft && styles.badgeTextDraft, inactive && styles.badgeTextInactive, sold && styles.badgeTextSold]}>{draft ? 'Piszkozat' : inactive ? 'Inaktív' : sold ? 'Eladva' : 'Publikus'}</Text></View>
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F1EB' },
  content: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 60 : 85, paddingBottom: 150 },
  shell: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: 28 },
  headerMobile: { flexDirection: 'column', alignItems: 'stretch' },
  eyebrow: { color: '#9B7141', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#1D2923', fontSize: Platform.OS === 'web' ? 48 : 37, lineHeight: Platform.OS === 'web' ? 56 : 44, fontWeight: '800', letterSpacing: -1.5, marginTop: 10 },
  subtitle: { color: '#66716A', fontSize: 16, lineHeight: 25, marginTop: 10, maxWidth: 620 },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerActionsMobile: { width: '100%' },
  inquiryButton: { minHeight: 54, paddingHorizontal: 20, borderRadius: 14, backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#D9D3CA', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  inquiryButtonText: { color: '#2E4639', fontSize: 14, fontWeight: '800' },
  notificationBadge: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: '#D8423C', paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  notificationBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  addButton: { minHeight: 54, paddingHorizontal: 23, borderRadius: 14, backgroundColor: '#2E4639', flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 38 },
  stat: { flexGrow: 1, minWidth: 190, backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E3DED5', borderRadius: 18, padding: 19, flexDirection: 'row', gap: 14, alignItems: 'center' },
  statIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#E8EEE9', alignItems: 'center', justifyContent: 'center' },
  statValue: { color: '#1D2923', fontSize: 25, fontWeight: '800' },
  statLabel: { color: '#78817B', marginTop: 2, fontSize: 13 },
  listHeader: { marginTop: 44, marginBottom: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { color: '#1D2923', fontSize: 25, fontWeight: '800' },
  listCount: { color: '#7B837E', fontWeight: '600' },
  center: { paddingVertical: 80 },
  empty: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E3DED5', borderRadius: 22, alignItems: 'center', padding: 44 },
  emptyIcon: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#F0E5D6', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#1D2923', fontSize: 23, fontWeight: '800', marginTop: 20 },
  emptyText: { color: '#737C76', textAlign: 'center', lineHeight: 23, maxWidth: 500, marginTop: 9 },
  emptyButton: { marginTop: 23, minHeight: 52, paddingHorizontal: 22, borderRadius: 14, backgroundColor: '#2E4639', justifyContent: 'center' },
  cards: { gap: 13 },
  card: { minHeight: 160, backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E3DED5', borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 18 },
  cardMobile: { flexDirection: 'column', alignItems: 'stretch' },
  image: { width: 190, height: 136, borderRadius: 13 },
  imageMobile: { width: '100%', height: 210 },
  imagePlaceholder: { backgroundColor: '#ECE6DC', alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, paddingVertical: 5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  badge: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#E6F1E9', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, alignSelf: 'flex-start' },
  badgeDraft: { backgroundColor: '#F4EBDD' },
  badgeInactive: { backgroundColor: '#ECECEC' },
  badgeSold: { backgroundColor: '#FBE5E3' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4E8961' },
  dotDraft: { backgroundColor: '#A9793E' },
  dotInactive: { backgroundColor: '#858585' },
  dotSold: { backgroundColor: '#C73E3A' },
  badgeText: { color: '#3F7550', fontSize: 11, fontWeight: '800' },
  badgeTextDraft: { color: '#8B6338' },
  badgeTextInactive: { color: '#696969' },
  badgeTextSold: { color: '#A72F2B' },
  date: { color: '#9A9F9C', fontSize: 12 },
  cardTitle: { color: '#1D2923', fontSize: 20, fontWeight: '800', marginTop: 11 },
  location: { color: '#7A827D', marginTop: 5 },
  price: { color: '#2E4639', fontSize: 19, fontWeight: '800', marginTop: 14 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 8 },
  actionsMobile: { padding: 0, justifyContent: 'flex-end' },
  iconButton: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#DDD8D0', alignItems: 'center', justifyContent: 'center' },
  editButton: { height: 44, paddingHorizontal: 15, borderRadius: 12, backgroundColor: '#2E4639', flexDirection: 'row', gap: 7, alignItems: 'center' },
  editText: { color: '#fff', fontWeight: '800', fontSize: 13 },
})
