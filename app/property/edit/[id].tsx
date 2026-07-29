import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { ArrowLeft, Camera, CheckCircle2, X } from 'lucide-react-native'
import { router, useLocalSearchParams } from 'expo-router'

import { supabase } from '@/src/services/supabase'
import { useAuth } from '@/src/providers/AuthProvider'
import { useProtectedRoute } from '@/src/hooks/useProtectedRoute'
import { syncPropertyImages, uploadPropertyImage } from '@/src/services/blob'

const statuses = [
  { value: 'published', label: 'Publikus', help: 'Mindenki láthatja' },
  { value: 'sold', label: 'Eladva', help: 'Piros jelzés a nyilvános hirdetésen' },
  { value: 'draft', label: 'Piszkozat', help: 'Csak te látod' },
  { value: 'inactive', label: 'Inaktív', help: 'Ideiglenesen rejtett' },
]

export default function EditProperty() {
  useProtectedRoute()
  const { id } = useLocalSearchParams()
  const { session } = useAuth()
  const { width } = useWindowDimensions()
  const desktop = width >= 850
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [listingType, setListingType] = useState('Eladó')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [area, setArea] = useState('')
  const [parking, setParking] = useState('')
  const [status, setStatus] = useState('published')
  const [images, setImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  useEffect(() => {
    async function load() {
      if (!session?.user?.id) return
      try {
        setLoading(true)
        const { data, error } = await supabase.from('properties').select('*').eq('id', id).eq('owner_id', session.user.id).single()
        if (error) throw error
        setTitle(data.title || '')
        setLocation(data.location || '')
        setPrice(String(data.price || ''))
        setDescription(data.description || '')
        setCategory(data.category || 'Lakás')
        setListingType(data.listing_type || 'Eladó')
        setBedrooms(String(data.bedrooms || ''))
        setBathrooms(String(data.bathrooms || ''))
        setArea(String(data.area || ''))
        setParking(String(data.parking || '0'))
        setStatus(data.status || 'published')
        let gallery: string[] = []
        if (Array.isArray(data.gallery)) gallery = data.gallery
        else if (typeof data.gallery === 'string') {
          try {
            const parsed = JSON.parse(data.gallery)
            if (Array.isArray(parsed)) gallery = parsed
          } catch {}
        }
        setImages(gallery.length ? gallery : data.image ? [data.image] : [])
      } catch (error) {
        console.log(error)
        Alert.alert('Nem szerkeszthető', 'A hirdetés nem található, vagy nem a saját hirdetésed.')
        router.back()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, session?.user?.id])

  async function pickImages() {
    if (images.length >= 10) {
      Alert.alert('Képlimit', 'Legfeljebb 10 képet tölthetsz fel.')
      return
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 10 - images.length,
        quality: 0.9,
      })
      if (result.canceled) return

      setUploadingImages(true)
      const urls = await Promise.all(
        result.assets
          .slice(0, 10 - images.length)
          .map((asset) => uploadPropertyImage(asset.uri, asset.mimeType || 'image/jpeg'))
      )
      setImages((current) => [...current, ...urls])
    } catch (error) {
      console.error('Property image upload failed:', error)
      Alert.alert('Feltöltési hiba', 'A képeket nem sikerült feltölteni.')
    } finally {
      setUploadingImages(false)
    }
  }

  async function save() {
    setSaveError('')

    if (!title.trim() || !location.trim() || Number(price) <= 0 || Number(area) <= 0) {
      Alert.alert('Hiányzó adatok', 'A cím, helyszín, ár és alapterület kitöltése kötelező.')
      return
    }
    if (!images.length) {
      Alert.alert('Hiányzó kép', 'A hirdetéshez legalább egy kép szükséges.')
      return
    }
    try {
      setSaving(true)
      const { error } = await supabase.from('properties').update({
        title: title.trim(),
        location: location.trim(),
        price: Number(price),
        description: description.trim(),
        category: category.trim(),
        listing_type: listingType,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 0,
        area: Number(area),
        parking: Number(parking) || 0,
        status,
      }).eq('id', id).eq('owner_id', session?.user?.id)
      if (error) throw error
      await syncPropertyImages(String(id), images)
      Alert.alert('Mentve', 'A hirdetés módosításai sikeresen elmentve.', [{ text: 'Rendben', onPress: () => router.replace('/dashboard') }])
    } catch (error) {
      console.error('Property update failed:', error)
      setSaveError(
        status === 'sold'
          ? 'Az „Eladva” állapotot az adatbázis még nem engedélyezi. Futtasd le a mellékelt Neon SQL-frissítést.'
          : 'A módosításokat nem sikerült elmenteni. Próbáld újra.'
      )
      Alert.alert('Mentési hiba', 'A módosításokat nem sikerült elmenteni.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#8B6338" /></View>

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.shell}>
        <Pressable onPress={() => router.back()} style={styles.back}><ArrowLeft size={18} color="#455149" /><Text style={styles.backText}>Vissza</Text></Pressable>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SAJÁT HIRDETÉS</Text>
          <Text style={styles.title}>Hirdetés szerkesztése</Text>
          <Text style={styles.subtitle}>Frissítsd az adatokat vagy változtasd meg a hirdetés láthatóságát.</Text>
        </View>

        <View style={[styles.grid, desktop && styles.gridDesktop]}>
          <View style={styles.form}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Alapadatok</Text>
              <Field label="Hirdetés címe" value={title} onChangeText={setTitle} />
              <View style={[styles.row, desktop && styles.rowDesktop]}>
                <View style={styles.flex}><Field label="Helyszín" value={location} onChangeText={setLocation} /></View>
                <View style={styles.flex}><Field label="Ár (Ft)" value={price} onChangeText={setPrice} keyboardType="numeric" /></View>
              </View>
              <View style={[styles.row, desktop && styles.rowDesktop]}>
                <View style={styles.flex}><Field label="Kategória" value={category} onChangeText={setCategory} /></View>
                <View style={styles.flex}><Field label="Hirdetés típusa" value={listingType} onChangeText={setListingType} /></View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tulajdonságok és leírás</Text>
              <View style={[styles.row, desktop && styles.rowDesktop]}>
                <View style={styles.flex}><Field label="Szobák" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" /></View>
                <View style={styles.flex}><Field label="Fürdő" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" /></View>
                <View style={styles.flex}><Field label="Alapterület" value={area} onChangeText={setArea} keyboardType="numeric" /></View>
                <View style={styles.flex}><Field label="Parkoló" value={parking} onChangeText={setParking} keyboardType="numeric" /></View>
              </View>
              <Field label="Bemutatás" value={description} onChangeText={setDescription} multiline />
            </View>
          </View>

          <View style={[styles.sidebar, desktop && styles.sidebarDesktop]}>
            {images[0] ? <Image source={{ uri: images[0] }} contentFit="cover" style={styles.preview} /> : null}
            <View style={styles.imageCard}>
              <Text style={styles.cardTitle}>Fotók</Text>
              <Text style={styles.imageHelp}>Az első kép a borítókép. Legfeljebb 10 kép tölthető fel.</Text>
              <Pressable onPress={pickImages} disabled={uploadingImages} style={styles.imagePicker}>
                {uploadingImages ? <ActivityIndicator color="#8B6338" /> : <Camera size={20} color="#8B6338" />}
                <Text style={styles.imagePickerText}>{uploadingImages ? 'Képek optimalizálása…' : 'Új képek hozzáadása'}</Text>
              </Pressable>
              <View style={styles.gallery}>
                {images.map((uri, index) => (
                  <View key={uri} style={styles.thumbWrap}>
                    <Image source={{ uri }} contentFit="cover" style={styles.thumb} />
                    {index === 0 && <Text style={styles.coverLabel}>BORÍTÓ</Text>}
                    <Pressable onPress={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={styles.removeImage}>
                      <X size={13} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.cardTitle}>Hirdetés állapota</Text>
              {statuses.map((item) => (
                <Pressable key={item.value} onPress={() => setStatus(item.value)} style={[styles.statusOption, status === item.value && styles.statusSelected]}>
                  <View style={{ flex: 1 }}><Text style={[styles.statusLabel, status === item.value && styles.statusLabelSelected]}>{item.label}</Text><Text style={[styles.statusHelp, status === item.value && styles.statusHelpSelected]}>{item.help}</Text></View>
                  {status === item.value && <CheckCircle2 size={20} color="#fff" />}
                </Pressable>
              ))}
            </View>
            <Pressable onPress={save} disabled={saving} style={styles.save}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Módosítások mentése</Text>}
            </Pressable>
            {!!saveError && <Text style={styles.saveError}>{saveError}</Text>}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

function Field({ label, multiline, ...props }: any) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} placeholderTextColor="#9A9E99" style={[styles.input, multiline && styles.textarea]} /></View>
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F1EB' },
  content: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 42 : 70, paddingBottom: 130 },
  shell: { width: '100%', maxWidth: 1160, alignSelf: 'center' },
  loading: { flex: 1, backgroundColor: '#F4F1EB', alignItems: 'center', justifyContent: 'center' },
  back: { flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 9 },
  backText: { color: '#455149', fontWeight: '700' },
  header: { marginTop: 24, marginBottom: 31 },
  eyebrow: { color: '#9B7141', fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  title: { color: '#1D2923', fontSize: Platform.OS === 'web' ? 44 : 35, fontWeight: '800', letterSpacing: -1.2, marginTop: 8 },
  subtitle: { color: '#68736C', fontSize: 16, lineHeight: 24, marginTop: 10 },
  grid: { gap: 22 },
  gridDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  form: { flex: 1, gap: 18 },
  card: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 21, padding: 23, gap: 17 },
  cardTitle: { color: '#1D2923', fontSize: 20, fontWeight: '800', marginBottom: 2 },
  row: { gap: 13 },
  rowDesktop: { flexDirection: 'row' },
  flex: { flex: 1 },
  field: { gap: 8 },
  label: { color: '#3D4942', fontSize: 13, fontWeight: '800' },
  input: { minHeight: 55, borderRadius: 13, borderWidth: 1, borderColor: '#D8D2C9', backgroundColor: '#FAF9F6', color: '#1D2923', paddingHorizontal: 16, fontSize: 15, outlineStyle: 'none' as any },
  textarea: { minHeight: 150, paddingTop: 15, lineHeight: 23 },
  sidebar: { width: '100%', gap: 13 },
  sidebarDesktop: { width: 360, flexShrink: 0 },
  preview: { width: '100%', height: 220, borderRadius: 20 },
  imageCard: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 21, padding: 18, gap: 12 },
  imageHelp: { color: '#7A837D', fontSize: 12, lineHeight: 18 },
  imagePicker: { minHeight: 48, borderRadius: 13, borderWidth: 1, borderStyle: 'dashed', borderColor: '#CDBB9F', backgroundColor: '#FAF6EF', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  imagePickerText: { color: '#6E5A40', fontSize: 13, fontWeight: '800' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbWrap: { width: 92, height: 68, borderRadius: 10, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  coverLabel: { position: 'absolute', left: 5, bottom: 5, color: '#FFFFFF', backgroundColor: '#2E4639', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 3, fontSize: 8, fontWeight: '900' },
  removeImage: { position: 'absolute', right: 4, top: 4, width: 23, height: 23, borderRadius: 12, backgroundColor: 'rgba(0,0,0,.68)', alignItems: 'center', justifyContent: 'center' },
  statusCard: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#E1DCD4', borderRadius: 21, padding: 18, gap: 9 },
  statusOption: { borderWidth: 1, borderColor: '#DDD7CF', borderRadius: 13, padding: 14, flexDirection: 'row', alignItems: 'center' },
  statusSelected: { backgroundColor: '#2E4639', borderColor: '#2E4639' },
  statusLabel: { color: '#354139', fontWeight: '800' },
  statusLabelSelected: { color: '#fff' },
  statusHelp: { color: '#858C87', fontSize: 12, marginTop: 3 },
  statusHelpSelected: { color: '#CFD9D2' },
  save: { minHeight: 57, borderRadius: 14, backgroundColor: '#2E4639', alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  saveError: { color: '#A64D49', fontSize: 13, lineHeight: 19, textAlign: 'center', paddingHorizontal: 8 },
})
