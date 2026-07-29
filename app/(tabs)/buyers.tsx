import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, TextInputProps, View, useWindowDimensions,
} from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Building2, Mail, Pause, Plus, RefreshCw, Sparkles, UserRound, Users } from 'lucide-react-native'

import { useAuth } from '@/src/providers/AuthProvider'
import { useProtectedRoute } from '@/src/hooks/useProtectedRoute'
import { supabase } from '@/src/services/supabase'

type Buyer = {
  id: number; inquiry_id?: number; customer_name: string; customer_email: string;
  customer_phone: string; wanted_locations: string[]; property_types: string[];
  listing_type: string; min_price?: number; max_price?: number; min_bedrooms: number;
  min_area: number; financing: string; move_timeline: string; notes: string;
  status: 'active' | 'paused' | 'matched' | 'archived';
}
type Match = { id: number; buyer_profile_id: number; property_id: number; score: number; reasons: string[]; status: string }
type Property = { id: number; title: string; location: string; price: number; image?: string; category?: string }

const propertyTypes = ['Lakás', 'Családi ház', 'Villa', 'Telek', 'Nyaraló', 'Iroda']
const emptyForm = {
  customer_name: '', customer_email: '', customer_phone: '', locations: '',
  propertyType: '', minPrice: '', maxPrice: '', minBedrooms: '', minArea: '',
  financing: 'mindegy', moveTimeline: '', notes: '',
}

export default function BuyersScreen() {
  useProtectedRoute()
  const { session } = useAuth()
  const params = useLocalSearchParams<{ inquiryId?: string }>()
  const { width } = useWindowDimensions()
  const mobile = width < 760
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(!!params.inquiryId)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorText, setErrorText] = useState('')

  const load = useCallback(async () => {
    if (!session?.user?.id) return
    setLoading(true)
    setErrorText('')
    try {
      const [buyerResult, matchResult, propertyResult] = await Promise.all([
        supabase.from('buyer_profiles').select('*').eq('owner_id', session.user.id).neq('status', 'archived').order('created_at', { ascending: false }),
        supabase.from('property_matches').select('*').eq('owner_id', session.user.id).order('score', { ascending: false }),
        supabase.from('properties').select('id,title,location,price,image,category').eq('owner_id', session.user.id).eq('status', 'published'),
      ])
      if (buyerResult.error) throw buyerResult.error
      if (matchResult.error) throw matchResult.error
      if (propertyResult.error) throw propertyResult.error
      setBuyers((buyerResult.data || []) as Buyer[])
      setMatches((matchResult.data || []) as Match[])
      setProperties((propertyResult.data || []) as Property[])

      if (params.inquiryId) {
        const { data: inquiry, error } = await supabase.from('inquiries').select('*')
          .eq('id', Number(params.inquiryId)).eq('owner_id', session.user.id).single()
        if (!error && inquiry) {
          const related = (propertyResult.data || []).find((item: any) => Number(item.id) === Number(inquiry.property_id))
          setForm({
            ...emptyForm,
            customer_name: inquiry.customer_name || '',
            customer_email: inquiry.customer_email || '',
            customer_phone: inquiry.customer_phone || '',
            locations: related?.location || '',
            propertyType: related?.category || '',
            maxPrice: related?.price ? String(Math.round(Number(related.price) * 1.1)) : '',
            notes: inquiry.message || '',
          })
          setShowForm(true)
        }
      }
    } catch (error) {
      console.error(error)
      setErrorText('A vevőprofilok még nem érhetők el. Futtasd le a mellékelt Neon SQL-fájlt.')
    } finally {
      setLoading(false)
    }
  }, [params.inquiryId, session?.user?.id])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const propertyMap = useMemo(() => new Map(properties.map((item) => [Number(item.id), item])), [properties])

  async function saveBuyer() {
    if (!session?.user?.id || !form.customer_name.trim() || !form.locations.trim()) {
      setErrorText('A név és legalább egy keresett település megadása szükséges.')
      return
    }
    setSaving(true)
    setErrorText('')
    try {
      const payload = {
        owner_id: session.user.id,
        inquiry_id: params.inquiryId ? Number(params.inquiryId) : null,
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        customer_phone: form.customer_phone.trim(),
        wanted_locations: form.locations.split(',').map((v) => v.trim()).filter(Boolean),
        property_types: form.propertyType ? [form.propertyType] : [],
        listing_type: 'Eladó',
        min_price: form.minPrice ? Number(form.minPrice) : null,
        max_price: form.maxPrice ? Number(form.maxPrice) : null,
        min_bedrooms: Number(form.minBedrooms) || 0,
        min_area: Number(form.minArea) || 0,
        financing: form.financing,
        move_timeline: form.moveTimeline.trim(),
        notes: form.notes.trim(),
        status: 'active',
      }
      const existing = params.inquiryId
        ? buyers.find((buyer) => Number(buyer.inquiry_id) === Number(params.inquiryId))
        : undefined
      const request = existing
        ? supabase.from('buyer_profiles').update(payload).eq('id', existing.id).eq('owner_id', session.user.id)
        : supabase.from('buyer_profiles').insert(payload)
      const { error } = await request
      if (error) throw error
      setForm(emptyForm)
      setShowForm(false)
      router.setParams({ inquiryId: undefined })
      await load()
    } catch (error) {
      console.error(error)
      setErrorText('A vevőprofilt nem sikerült menteni. Ellenőrizd az SQL-frissítést.')
    } finally {
      setSaving(false)
    }
  }

  async function setBuyerStatus(buyer: Buyer, status: 'active' | 'paused') {
    const { error } = await supabase.from('buyer_profiles').update({ status }).eq('id', buyer.id).eq('owner_id', session?.user?.id)
    if (!error) await load()
  }

  async function sendMatch(buyer: Buyer, match: Match, property: Property) {
    const origin = Platform.OS === 'web' && globalThis.location ? globalThis.location.origin : 'https://www.realvia.hu'
    const url = `${origin}/property/${property.id}`
    const subject = encodeURIComponent(`Ezt az ingatlant Önnek válogattuk – ${property.location}`)
    const body = encodeURIComponent(
      `Kedves ${buyer.customer_name}!\n\nA megadott igényei alapján találtunk egy ${match.score}%-ban megfelelő ingatlant:\n\n${property.title}\n${property.location} · ${Number(property.price).toLocaleString('hu-HU')} Ft\n\nMegtekintés: ${url}\n\nÜdvözlettel:\nRealvia`
    )
    await supabase.from('property_matches').update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', match.id).eq('owner_id', session?.user?.id)
    await Linking.openURL(`mailto:${buyer.customer_email}?subject=${subject}&body=${body}`)
    setMatches((current) => current.map((item) => item.id === match.id ? { ...item, status: 'sent' } : item))
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.shell}>
        <Pressable onPress={() => router.push('/dashboard')} style={styles.back}><ArrowLeft size={18} color="#455149" /><Text style={styles.backText}>Saját hirdetéseim</Text></Pressable>
        <View style={[styles.header, mobile && styles.stack]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>VEVŐI IGÉNYEK</Text>
            <Text style={[styles.title, mobile && styles.titleMobile]}>Vevők és találatok</Text>
            <Text style={styles.subtitle}>Rögzítsd, mit keres az ügyfél. A Realvia automatikusan rangsorolja a megfelelő ingatlanokat.</Text>
          </View>
          <Pressable onPress={() => { setForm(emptyForm); setShowForm(!showForm) }} style={styles.primary}><Plus size={18} color="#fff" /><Text style={styles.primaryText}>Új vevőprofil</Text></Pressable>
        </View>

        {!!errorText && <Text style={styles.error}>{errorText}</Text>}

        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}><View style={styles.iconCircle}><UserRound size={21} color="#8B6338" /></View><View><Text style={styles.sectionTitle}>Mit keres az ügyfél?</Text><Text style={styles.hint}>A pontosabb igény jobb találatokat ad.</Text></View></View>
            <View style={[styles.row, mobile && styles.stack]}>
              <Field label="Név *" value={form.customer_name} onChangeText={(v) => setForm({ ...form, customer_name: v })} placeholder="Teljes név" />
              <Field label="E-mail" value={form.customer_email} onChangeText={(v) => setForm({ ...form, customer_email: v })} placeholder="email@pelda.hu" />
              <Field label="Telefonszám" value={form.customer_phone} onChangeText={(v) => setForm({ ...form, customer_phone: v })} placeholder="+36 30..." />
            </View>
            <Field label="Keresett település vagy kerület *" value={form.locations} onChangeText={(v) => setForm({ ...form, locations: v })} placeholder="pl. Debrecen, Mikepércs" />
            <Text style={[styles.label, styles.propertyTypeLabel]}>Ingatlantípus</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {propertyTypes.map((type) => <Pressable key={type} onPress={() => setForm({ ...form, propertyType: form.propertyType === type ? '' : type })} style={[styles.chip, form.propertyType === type && styles.chipActive]}><Text style={[styles.chipText, form.propertyType === type && styles.chipTextActive]}>{type}</Text></Pressable>)}
            </ScrollView>
            <View style={[styles.row, mobile && styles.stack]}>
              <Field label="Minimum ár (Ft)" value={form.minPrice} onChangeText={(v) => setForm({ ...form, minPrice: v })} keyboardType="numeric" />
              <Field label="Maximum ár (Ft)" value={form.maxPrice} onChangeText={(v) => setForm({ ...form, maxPrice: v })} keyboardType="numeric" />
              <Field label="Minimum szoba" value={form.minBedrooms} onChangeText={(v) => setForm({ ...form, minBedrooms: v })} keyboardType="numeric" />
              <Field label="Minimum m²" value={form.minArea} onChangeText={(v) => setForm({ ...form, minArea: v })} keyboardType="numeric" />
            </View>
            <View style={[styles.row, mobile && styles.stack]}>
              <Field label="Költözés várható ideje" value={form.moveTimeline} onChangeText={(v) => setForm({ ...form, moveTimeline: v })} placeholder="pl. 3 hónapon belül" />
              <Field label="Megjegyzés" value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Fontos szempontok..." />
            </View>
            <Pressable disabled={saving} onPress={saveBuyer} style={styles.save}>{saving ? <ActivityIndicator color="#fff" /> : <><Sparkles size={18} color="#fff" /><Text style={styles.primaryText}>Profil mentése és találatok keresése</Text></>}</Pressable>
          </View>
        )}

        {loading ? <ActivityIndicator style={{ marginTop: 70 }} size="large" color="#8B6338" /> : buyers.length === 0 ? (
          <View style={styles.empty}><Users size={34} color="#9B7141" /><Text style={styles.emptyTitle}>Még nincs vevőprofil</Text><Text style={styles.hint}>Hozd létre az elsőt, vagy nyiss meg egy érdeklődést és készíts belőle profilt.</Text></View>
        ) : (
          <View style={styles.list}>
            {buyers.map((buyer) => {
              const buyerMatches = matches.filter((match) => match.buyer_profile_id === buyer.id)
              return <View key={buyer.id} style={styles.buyerCard}>
                <View style={[styles.buyerHeader, mobile && styles.stack]}>
                  <View style={{ flex: 1 }}><View style={styles.nameRow}><Text style={styles.buyerName}>{buyer.customer_name}</Text><View style={[styles.status, buyer.status === 'paused' && styles.paused]}><Text style={styles.statusText}>{buyer.status === 'paused' ? 'Szüneteltetve' : 'Aktív kereső'}</Text></View></View><Text style={styles.buyerMeta}>{buyer.wanted_locations.join(', ')}{buyer.property_types.length ? ` · ${buyer.property_types.join(', ')}` : ''}{buyer.max_price ? ` · max. ${Number(buyer.max_price).toLocaleString('hu-HU')} Ft` : ''}</Text></View>
                  <Pressable onPress={() => setBuyerStatus(buyer, buyer.status === 'paused' ? 'active' : 'paused')} style={styles.secondary}><Pause size={15} color="#56645B" /><Text style={styles.secondaryText}>{buyer.status === 'paused' ? 'Aktiválás' : 'Szüneteltetés'}</Text></Pressable>
                </View>
                <View style={styles.matchTitleRow}><Text style={styles.matchTitle}>Automatikus találatok</Text><Text style={styles.matchCount}>{buyerMatches.length} ingatlan</Text></View>
                {buyerMatches.length === 0 ? <Text style={styles.noMatch}>Jelenleg nincs megfelelő aktív hirdetés. Új ingatlan feltöltésekor a lista automatikusan frissül.</Text> : buyerMatches.map((match) => {
                  const property = propertyMap.get(Number(match.property_id))
                  if (!property) return null
                  return <View key={match.id} style={[styles.match, mobile && styles.stack]}>
                    <View style={styles.score}><Text style={styles.scoreValue}>{match.score}%</Text><Text style={styles.scoreLabel}>EGYEZÉS</Text></View>
                    <View style={{ flex: 1 }}><Pressable onPress={() => router.push(`/property/${property.id}`)}><Text style={styles.propertyTitle}>{property.title}</Text></Pressable><Text style={styles.propertyMeta}>{property.location} · {Number(property.price).toLocaleString('hu-HU')} Ft</Text><View style={styles.reasons}>{(match.reasons || []).map((reason) => <Text key={reason} style={styles.reason}>✓ {reason}</Text>)}</View></View>
                    <Pressable disabled={!buyer.customer_email} onPress={() => sendMatch(buyer, match, property)} style={[styles.mail, !buyer.customer_email && { opacity: .4 }]}><Mail size={16} color="#fff" /><Text style={styles.mailText}>{match.status === 'sent' ? 'Újraküldés' : 'Ajánlat küldése'}</Text></Pressable>
                  </View>
                })}
              </View>
            })}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} placeholderTextColor="#A19D96" style={styles.input} /></View>
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F1EB' }, content: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 42 : 72, paddingBottom: 140 },
  shell: { width: '100%', maxWidth: 1180, alignSelf: 'center' }, back: { flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 9 }, backText: { color: '#455149', fontWeight: '800' },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: 24, marginTop: 20, marginBottom: 28 }, stack: { flexDirection: 'column', alignItems: 'stretch' },
  eyebrow: { color: '#9B7141', fontSize: 12, fontWeight: '900', letterSpacing: 2 }, title: { color: '#1D2923', fontSize: 46, lineHeight: 53, fontWeight: '900', letterSpacing: -1.5, marginTop: 8 }, titleMobile: { fontSize: 34, lineHeight: 40 },
  subtitle: { color: '#66716A', fontSize: 16, lineHeight: 24, maxWidth: 700, marginTop: 8 }, primary: { minHeight: 52, paddingHorizontal: 20, borderRadius: 15, backgroundColor: '#2E4B3C', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, primaryText: { color: '#fff', fontWeight: '900' },
  error: { color: '#A64D49', backgroundColor: '#FCEBE9', borderRadius: 13, padding: 14, textAlign: 'center', marginBottom: 16 }, formCard: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 22, padding: 24, gap: 15, marginBottom: 26 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }, iconCircle: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#F1E7D8', alignItems: 'center', justifyContent: 'center' }, sectionTitle: { color: '#1D2923', fontSize: 22, fontWeight: '900' }, hint: { color: '#778078', fontSize: 14, lineHeight: 21 },
  row: { flexDirection: 'row', gap: 12 }, field: { flex: 1, minWidth: 0 }, label: { color: '#35463D', fontSize: 12, fontWeight: '900', marginBottom: 7 }, input: { minHeight: 52, borderRadius: 13, borderWidth: 1, borderColor: '#DDD6CC', backgroundColor: '#FCFAF7', paddingHorizontal: 15, color: '#24332B', fontSize: 14 },
  propertyTypeLabel: { marginTop: 12, marginBottom: 3 },
  chips: { gap: 8 }, chip: { minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: '#DAD4CB', paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' }, chipActive: { backgroundColor: '#2E4B3C', borderColor: '#2E4B3C' }, chipText: { color: '#66716A', fontWeight: '800', fontSize: 12 }, chipTextActive: { color: '#fff' },
  save: { minHeight: 55, borderRadius: 14, backgroundColor: '#2E4B3C', flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  empty: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 22, padding: 46, alignItems: 'center', gap: 10 }, emptyTitle: { color: '#1D2923', fontSize: 22, fontWeight: '900' },
  list: { gap: 18 }, buyerCard: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 22, padding: 22 }, buyerHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' }, nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }, buyerName: { color: '#1D2923', fontSize: 23, fontWeight: '900' }, buyerMeta: { color: '#727C75', fontSize: 14, marginTop: 5 },
  status: { backgroundColor: '#E1EEE4', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 }, paused: { backgroundColor: '#ECEAE5' }, statusText: { color: '#486052', fontSize: 10, fontWeight: '900' }, secondary: { minHeight: 40, borderRadius: 11, borderWidth: 1, borderColor: '#DAD5CD', paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, secondaryText: { color: '#56645B', fontSize: 12, fontWeight: '800' },
  matchTitleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#E8E2D9' }, matchTitle: { color: '#384A40', fontSize: 14, fontWeight: '900' }, matchCount: { color: '#929791', fontSize: 12 }, noMatch: { color: '#7A837D', backgroundColor: '#F7F4EE', borderRadius: 13, padding: 16, marginTop: 12, lineHeight: 20 },
  match: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 15, borderRadius: 15, backgroundColor: '#F7F4EE', marginTop: 10 }, score: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#2E4B3C', alignItems: 'center', justifyContent: 'center' }, scoreValue: { color: '#fff', fontSize: 20, fontWeight: '900' }, scoreLabel: { color: '#DDE8E0', fontSize: 8, fontWeight: '900' }, propertyTitle: { color: '#1E2D25', fontSize: 16, fontWeight: '900' }, propertyMeta: { color: '#758078', fontSize: 12, marginTop: 4 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }, reason: { color: '#537060', fontSize: 10, backgroundColor: '#E5EEE8', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4 }, mail: { minHeight: 42, borderRadius: 11, paddingHorizontal: 13, backgroundColor: '#9B7141', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, mailText: { color: '#fff', fontSize: 11, fontWeight: '900' },
})
