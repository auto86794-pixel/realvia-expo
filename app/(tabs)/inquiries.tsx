import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, ExternalLink, Mail, MessageSquare, Phone, Trophy, UserRoundPlus } from 'lucide-react-native'

import { supabase } from '@/src/services/supabase'
import { useAuth } from '@/src/providers/AuthProvider'
import { useProtectedRoute } from '@/src/hooks/useProtectedRoute'

type Inquiry = {
  id: number
  property_id?: number
  property_title: string
  inquiry_type?: 'viewing' | 'callback' | 'information'
  customer_name: string
  customer_email: string
  customer_phone: string
  preferred_time_one?: string
  preferred_time_two?: string
  message?: string
  status?: 'new' | 'contacted' | 'scheduled' | 'successful' | 'closed'
  read_at?: string | null
  created_at?: string
}

const statusOptions = [
  { value: 'new', label: 'Új' },
  { value: 'contacted', label: 'Kapcsolatfelvétel' },
  { value: 'scheduled', label: 'Időpont egyeztetve' },
  { value: 'successful', label: 'Sikeres' },
  { value: 'closed', label: 'Lezárva' },
]

const typeLabels: Record<string, string> = {
  viewing: 'Megtekintési kérés',
  callback: 'Visszahíváskérés',
  information: 'Információkérés',
}

export default function InquiriesScreen() {
  useProtectedRoute()
  const { session } = useAuth()
  const { width } = useWindowDimensions()
  const mobile = width < 760
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState('')
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const loadInquiries = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      setLoading(true)
      setErrorText('')
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setInquiries((data || []) as Inquiry[])
    } catch (error) {
      console.error('Inquiry loading failed:', error)
      setErrorText('Az érdeklődések most nem tölthetők be. Ellenőrizd, hogy lefuttattad-e a mellékelt Neon SQL-frissítést.')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useFocusEffect(useCallback(() => { loadInquiries() }, [loadInquiries]))

  const visibleInquiries = useMemo(
    () => filter === 'all'
      ? inquiries
      : filter === 'unread'
        ? inquiries.filter((item) => !item.read_at)
        : inquiries.filter((item) => (item.status || 'new') === filter),
    [filter, inquiries]
  )

  const unreadCount = inquiries.filter((item) => !item.read_at).length
  const newCount = inquiries.filter((item) => (item.status || 'new') === 'new').length
  const scheduledCount = inquiries.filter((item) => item.status === 'scheduled').length
  const successfulCount = inquiries.filter((item) => item.status === 'successful').length

  async function updateStatus(id: number, status: string) {
    try {
      setUpdatingId(id)
      const readAt = new Date().toISOString()
      const { error } = await supabase
        .from('inquiries')
        .update({ status, read_at: readAt, updated_at: readAt })
        .eq('id', id)
        .eq('owner_id', session?.user?.id)
      if (error) throw error
      setInquiries((current) => current.map((item) => item.id === id ? { ...item, status: status as Inquiry['status'], read_at: readAt } : item))
    } catch (error) {
      console.error('Inquiry status update failed:', error)
      setErrorText('Az érdeklődés állapotát nem sikerült módosítani.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function markAsRead(id: number) {
    try {
      setUpdatingId(id)
      const readAt = new Date().toISOString()
      const { error } = await supabase
        .from('inquiries')
        .update({ read_at: readAt, updated_at: readAt })
        .eq('id', id)
        .eq('owner_id', session?.user?.id)
      if (error) throw error
      setInquiries((current) => current.map((item) => item.id === id ? { ...item, read_at: readAt } : item))
    } catch (error) {
      console.error('Inquiry read update failed:', error)
      setErrorText('Az érdeklődést nem sikerült olvasottnak jelölni.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.shell}>
        <Pressable onPress={() => router.push('/dashboard')} style={styles.back}>
          <ArrowLeft size={18} color="#455149" />
          <Text style={styles.backText}>Saját hirdetéseim</Text>
        </Pressable>

        <View style={[styles.header, mobile && styles.headerMobile]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>KAPCSOLATOK</Text>
            <Text style={[styles.title, mobile && styles.titleMobile]}>Érdeklődések kezelése</Text>
            <Text style={styles.subtitle}>Minden megkeresés egy helyen, az első érdeklődéstől az egyeztetett megtekintésig.</Text>
          </View>
          <View style={styles.headerStats}>
            <MiniStat label="Olvasatlan" value={unreadCount} alert={unreadCount > 0} />
            <MiniStat label="Új" value={newCount} />
            <MiniStat label="Egyeztetve" value={scheduledCount} />
            <MiniStat label="Sikeres" value={successfulCount} success={successfulCount > 0} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterButton active={filter === 'all'} label="Összes" count={inquiries.length} onPress={() => setFilter('all')} />
          <FilterButton active={filter === 'unread'} label="Olvasatlan" count={unreadCount} onPress={() => setFilter('unread')} alert={unreadCount > 0} />
          {statusOptions.map((item) => (
            <FilterButton
              key={item.value}
              active={filter === item.value}
              label={item.label}
              count={inquiries.filter((inquiry) => (inquiry.status || 'new') === item.value).length}
              onPress={() => setFilter(item.value)}
            />
          ))}
        </ScrollView>

        {!!errorText && <Text style={styles.error}>{errorText}</Text>}

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#8B6338" /></View>
        ) : visibleInquiries.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><MessageSquare size={32} color="#8B6338" /></View>
            <Text style={styles.emptyTitle}>{filter === 'all' ? 'Még nincs érdeklődés' : 'Ebben az állapotban nincs érdeklődés'}</Text>
            <Text style={styles.emptyText}>Az ingatlanokra érkező megkeresések automatikusan itt fognak megjelenni.</Text>
          </View>
        ) : (
          <View style={styles.cards}>
            {visibleInquiries.map((inquiry) => {
              const status = inquiry.status || 'new'
              const unread = !inquiry.read_at
              const updating = updatingId === inquiry.id
              return (
                <View key={inquiry.id} style={[styles.card, unread && styles.cardUnread]}>
                  <View style={[styles.cardHeader, mobile && styles.cardHeaderMobile]}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.typeRow}>
                        {unread && <View style={styles.unreadBadge}><View style={styles.unreadDot} /><Text style={styles.unreadText}>ÚJ ÉRDEKLŐDÉS</Text></View>}
                        <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>{typeLabels[inquiry.inquiry_type || 'information']}</Text></View>
                        <StatusBadge status={status} />
                      </View>
                      <Pressable disabled={!inquiry.property_id} onPress={() => inquiry.property_id && router.push(`/property/${inquiry.property_id}`)}>
                        <Text style={styles.propertyTitle}>{inquiry.property_title}</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.date}>{inquiry.created_at ? new Date(inquiry.created_at).toLocaleString('hu-HU') : ''}</Text>
                  </View>

                  <View style={[styles.cardGrid, mobile && styles.cardGridMobile]}>
                    <View style={styles.customer}>
                      <Text style={styles.customerEyebrow}>ÉRDEKLŐDŐ ADATLAPJA</Text>
                      <Text style={styles.customerName}>{inquiry.customer_name}</Text>
                      <Pressable onPress={() => Linking.openURL(`tel:${inquiry.customer_phone}`)} style={styles.contactLine}>
                        <Phone size={16} color="#7B654B" /><Text style={styles.contactText}>{inquiry.customer_phone}</Text>
                      </Pressable>
                      <Pressable onPress={() => Linking.openURL(`mailto:${inquiry.customer_email}`)} style={styles.contactLine}>
                        <Mail size={16} color="#7B654B" /><Text style={styles.contactText}>{inquiry.customer_email}</Text>
                      </Pressable>
                      <View style={styles.quickActions}>
                        <Pressable onPress={() => Linking.openURL(`tel:${inquiry.customer_phone}`)} style={styles.quickActionPrimary}>
                          <Phone size={16} color="#FFFFFF" /><Text style={styles.quickActionPrimaryText}>Hívás</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => Linking.openURL(`mailto:${inquiry.customer_email}?subject=${encodeURIComponent(`Realvia – ${inquiry.property_title}`)}`)}
                          style={styles.quickAction}
                        >
                          <Mail size={16} color="#496052" /><Text style={styles.quickActionText}>E-mail</Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.details}>
                      {(inquiry.preferred_time_one || inquiry.preferred_time_two) && (
                        <View style={styles.timeCard}>
                          <View style={styles.detailTitleRow}><CalendarDays size={17} color="#496052" /><Text style={styles.detailTitle}>Javasolt időpontok</Text></View>
                          {!!inquiry.preferred_time_one && <Text style={styles.detailText}>1. {inquiry.preferred_time_one}</Text>}
                          {!!inquiry.preferred_time_two && <Text style={styles.detailText}>2. {inquiry.preferred_time_two}</Text>}
                        </View>
                      )}
                      {!!inquiry.message && (
                        <View style={styles.messageCard}>
                          <Text style={styles.detailTitle}>Üzenet</Text>
                          <Text style={styles.message}>{inquiry.message}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.workflow}>
                    <View style={styles.workflowHeader}>
                      <Text style={styles.workflowLabel}>Állapot módosítása</Text>
                      <View style={styles.workflowHeaderActions}>
                        <Pressable onPress={() => router.push(`/buyers?inquiryId=${inquiry.id}` as any)} style={styles.profileButton}><UserRoundPlus size={14} color="#FFFFFF" /><Text style={styles.profileButtonText}>Vevőprofil és találatok</Text></Pressable>
                        {!!inquiry.property_id && <Pressable onPress={() => router.push(`/property/${inquiry.property_id}`)} style={styles.propertyButton}><ExternalLink size={14} color="#496052" /><Text style={styles.propertyButtonText}>Ingatlan megnyitása</Text></Pressable>}
                        {unread && <Pressable disabled={updating} onPress={() => markAsRead(inquiry.id)} style={styles.readButton}><CheckCircle2 size={15} color="#496052" /><Text style={styles.readButtonText}>Olvasottnak jelölöm</Text></Pressable>}
                      </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workflowButtons}>
                      {statusOptions.map((item) => (
                        <Pressable
                          key={item.value}
                          disabled={updating}
                          onPress={() => updateStatus(inquiry.id, item.value)}
                          style={[styles.workflowButton, status === item.value && styles.workflowButtonActive]}
                        >
                          {updating && status !== item.value ? null : item.value === 'scheduled' ? <Clock3 size={15} color={status === item.value ? '#FFFFFF' : '#647068'} /> : item.value === 'successful' ? <Trophy size={15} color={status === item.value ? '#FFFFFF' : '#647068'} /> : item.value === 'closed' ? <CheckCircle2 size={15} color={status === item.value ? '#FFFFFF' : '#647068'} /> : null}
                          <Text style={[styles.workflowText, status === item.value && styles.workflowTextActive]}>{item.label}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

function MiniStat({ label, value, alert = false, success = false }: { label: string; value: number; alert?: boolean; success?: boolean }) {
  return <View style={[styles.miniStat, alert && styles.miniStatAlert, success && styles.miniStatSuccess]}><Text style={[styles.miniStatValue, alert && styles.miniStatValueAlert, success && styles.miniStatValueSuccess]}>{value}</Text><Text style={[styles.miniStatLabel, alert && styles.miniStatLabelAlert]}>{label}</Text></View>
}

function FilterButton({ active, label, count, onPress, alert = false }: { active: boolean; label: string; count: number; onPress: () => void; alert?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text><View style={[styles.filterCount, alert && !active && styles.filterCountAlert, active && styles.filterCountActive]}><Text style={[styles.filterCountText, alert && !active && styles.filterCountTextAlert, active && styles.filterCountTextActive]}>{count}</Text></View></Pressable>
}

function StatusBadge({ status }: { status: string }) {
  const option = statusOptions.find((item) => item.value === status)
  return <View style={[styles.statusBadge, status === 'new' && styles.statusNew, status === 'scheduled' && styles.statusScheduled, status === 'successful' && styles.statusSuccessful, status === 'closed' && styles.statusClosed]}><Text style={[styles.statusText, status === 'new' && styles.statusNewText, status === 'successful' && styles.statusSuccessfulText]}>{option?.label || 'Új'}</Text></View>
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F1EB' },
  content: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 45 : 75, paddingBottom: 140 },
  shell: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  back: { flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 9 },
  backText: { color: '#455149', fontWeight: '800' },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: 30, marginTop: 22 },
  headerMobile: { flexDirection: 'column', alignItems: 'stretch' },
  eyebrow: { color: '#9B7141', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#1D2923', fontSize: 46, lineHeight: 53, fontWeight: '800', letterSpacing: -1.4, marginTop: 9 },
  titleMobile: { fontSize: 34, lineHeight: 41 },
  subtitle: { color: '#66716A', fontSize: 16, lineHeight: 24, maxWidth: 650, marginTop: 9 },
  headerStats: { flexDirection: 'row', gap: 9 },
  miniStat: { minWidth: 86, backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 15, padding: 13, alignItems: 'center' },
  miniStatAlert: { backgroundColor: '#FCEBE9', borderColor: '#F0C8C4' },
  miniStatSuccess: { backgroundColor: '#E4F0E7', borderColor: '#C7DDCD' },
  miniStatValue: { color: '#2E4639', fontSize: 23, fontWeight: '900' },
  miniStatValueAlert: { color: '#B53D37' },
  miniStatValueSuccess: { color: '#2E6A43' },
  miniStatLabel: { color: '#858C87', fontSize: 11, marginTop: 2 },
  miniStatLabelAlert: { color: '#934A45' },
  filters: { gap: 9, paddingVertical: 30 },
  filter: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, borderColor: '#DDD7CF', backgroundColor: '#FFFDFC', flexDirection: 'row', gap: 8, alignItems: 'center' },
  filterActive: { backgroundColor: '#2E4639', borderColor: '#2E4639' },
  filterText: { color: '#57635B', fontSize: 13, fontWeight: '800' },
  filterTextActive: { color: '#FFFFFF' },
  filterCount: { minWidth: 23, height: 23, borderRadius: 12, backgroundColor: '#EEE9E1', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,.18)' },
  filterCountAlert: { backgroundColor: '#D8423C' },
  filterCountText: { color: '#6E7771', fontSize: 11, fontWeight: '800' },
  filterCountTextAlert: { color: '#FFFFFF' },
  filterCountTextActive: { color: '#FFFFFF' },
  error: { color: '#A64D49', backgroundColor: '#FCEBE9', borderRadius: 13, padding: 14, textAlign: 'center', marginBottom: 16 },
  center: { paddingVertical: 90 },
  empty: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 22, padding: 48, alignItems: 'center' },
  emptyIcon: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#F0E5D6', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#1D2923', fontSize: 23, fontWeight: '800', marginTop: 20, textAlign: 'center' },
  emptyText: { color: '#737C76', fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  cards: { gap: 15 },
  card: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 20, padding: 20 },
  cardUnread: { borderColor: '#D9A19C', borderLeftWidth: 5, backgroundColor: '#FFFCFA' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  cardHeaderMobile: { flexDirection: 'column' },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  unreadBadge: { backgroundColor: '#D8423C', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 6 },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  unreadText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  typeBadge: { backgroundColor: '#F1E7D8', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  typeBadgeText: { color: '#8A6235', fontSize: 11, fontWeight: '900' },
  statusBadge: { backgroundColor: '#ECEFEB', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  statusNew: { backgroundColor: '#FBE5E3' },
  statusScheduled: { backgroundColor: '#E3EEE6' },
  statusSuccessful: { backgroundColor: '#DCEEDF' },
  statusClosed: { backgroundColor: '#E9E9E9' },
  statusText: { color: '#5E6A63', fontSize: 11, fontWeight: '900' },
  statusNewText: { color: '#A6403B' },
  statusSuccessfulText: { color: '#2E6A43' },
  propertyTitle: { color: '#1D2923', fontSize: 20, fontWeight: '800', marginTop: 10 },
  date: { color: '#959B97', fontSize: 12 },
  cardGrid: { flexDirection: 'row', gap: 16, marginTop: 20 },
  cardGridMobile: { flexDirection: 'column' },
  customer: { width: 270, maxWidth: '100%', backgroundColor: '#F7F3EC', borderRadius: 15, padding: 16 },
  customerEyebrow: { color: '#9B7141', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7 },
  customerName: { color: '#27372E', fontSize: 18, fontWeight: '800', marginBottom: 11 },
  contactLine: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  contactText: { color: '#5F6B64', fontSize: 14 },
  quickActions: { flexDirection: 'row', gap: 8, marginTop: 13 },
  quickActionPrimary: { flex: 1, minHeight: 40, borderRadius: 11, backgroundColor: '#2E4B3C', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  quickActionPrimaryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  quickAction: { flex: 1, minHeight: 40, borderRadius: 11, borderWidth: 1, borderColor: '#CAD7CE', backgroundColor: '#FFFDFC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  quickActionText: { color: '#496052', fontSize: 12, fontWeight: '900' },
  details: { flex: 1, gap: 10 },
  timeCard: { backgroundColor: '#EAF0EB', borderRadius: 15, padding: 15 },
  messageCard: { backgroundColor: '#F8F6F1', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#E7E1D8' },
  detailTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  detailTitle: { color: '#35463D', fontSize: 13, fontWeight: '900' },
  detailText: { color: '#657269', fontSize: 14, marginTop: 7 },
  message: { color: '#66716A', fontSize: 14, lineHeight: 21, marginTop: 7 },
  workflow: { borderTopWidth: 1, borderTopColor: '#E7E1D8', marginTop: 18, paddingTop: 15 },
  workflowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 9 },
  workflowHeaderActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 7, flexWrap: 'wrap' },
  workflowLabel: { color: '#707A74', fontSize: 12, fontWeight: '800' },
  propertyButton: { minHeight: 34, borderRadius: 10, borderWidth: 1, borderColor: '#DAD5CD', backgroundColor: '#FFFDFC', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  propertyButtonText: { color: '#496052', fontSize: 11, fontWeight: '900' },
  profileButton: { minHeight: 34, borderRadius: 10, backgroundColor: '#2E4B3C', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  readButton: { minHeight: 34, borderRadius: 10, borderWidth: 1, borderColor: '#CAD7CE', backgroundColor: '#EAF0EB', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  readButtonText: { color: '#496052', fontSize: 11, fontWeight: '900' },
  workflowButtons: { flexDirection: 'row', gap: 8 },
  workflowButton: { minHeight: 38, paddingHorizontal: 13, borderRadius: 11, borderWidth: 1, borderColor: '#DAD5CD', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  workflowButtonActive: { backgroundColor: '#2E4639', borderColor: '#2E4639' },
  workflowText: { color: '#647068', fontSize: 12, fontWeight: '800' },
  workflowTextActive: { color: '#FFFFFF' },
})
