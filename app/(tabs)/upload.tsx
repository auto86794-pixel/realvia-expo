import { useState } from 'react'
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
import { router } from 'expo-router'
import { ArrowLeft, Camera, Check, Home, MapPin, X } from 'lucide-react-native'

import { uploadPropertyImage } from '@/src/services/blob'
import { supabase } from '@/src/services/supabase'
import { useAuth } from '@/src/providers/AuthProvider'
import { useProtectedRoute } from '@/src/hooks/useProtectedRoute'

const categories = ['Lakás', 'Családi ház', 'Villa', 'Telek', 'Nyaraló', 'Iroda']
const listingTypes = ['Eladó', 'Kiadó']

function numberFrom(value: string) {
  return Number(value.replace(/\s/g, '').replace(',', '.'))
}

export default function UploadScreen() {
  useProtectedRoute()
  const { session } = useAuth()
  const { width } = useWindowDimensions()
  const desktop = width >= 900

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [listingType, setListingType] = useState(listingTypes[0])
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [area, setArea] = useState('')
  const [parking, setParking] = useState('0')
  const [images, setImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formMessage, setFormMessage] = useState('')

  function resetForm() {
    setTitle('')
    setLocation('')
    setPrice('')
    setDescription('')
    setCategory(categories[0])
    setListingType(listingTypes[0])
    setBedrooms('')
    setBathrooms('')
    setArea('')
    setParking('0')
    setImages([])
    setUploadingImages(false)
    setFormMessage('')
  }

  async function pickImages() {
    try {
      if (images.length >= 10) {
        Alert.alert('Képlimit', 'Legfeljebb 10 képet tölthetsz fel.')
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 10 - images.length,
        quality: 0.78,
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
      console.log(error)
      Alert.alert('Feltöltési hiba', 'A képeket most nem sikerült feltölteni.')
    } finally {
      setUploadingImages(false)
    }
  }

  function validate() {
    if (!title.trim() || !location.trim() || !description.trim()) {
      return 'Add meg a címet, a helyszínt és a leírást.'
    }
    if (numberFrom(price) <= 0 || numberFrom(area) <= 0) {
      return 'Az ár és az alapterület legyen nullánál nagyobb szám.'
    }
    if (images.length === 0) return 'Tölts fel legalább egy képet.'
    return null
  }

  async function save(status: 'draft' | 'published') {
    setFormMessage('')
    const validationError =
      status === 'published'
        ? validate()
        : null
    if (validationError) {
      setFormMessage(validationError)
      Alert.alert('Még hiányzik néhány adat', validationError)
      return
    }
    if (!session?.user?.id) {
      setFormMessage('A mentéshez előbb jelentkezz be.')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.from('properties').insert({
        owner_id: session.user.id,
        title: title.trim() || 'Névtelen hirdetés',
        location: location.trim() || 'Helyszín nincs megadva',
        price: numberFrom(price) > 0 ? numberFrom(price) : 1,
        description: description.trim(),
        category,
        listing_type: listingType,
        status,
        image: images[0],
        gallery: images,
        bedrooms: numberFrom(bedrooms) || 0,
        bathrooms: numberFrom(bathrooms) || 0,
        area: numberFrom(area) > 0 ? numberFrom(area) : null,
        parking: numberFrom(parking) || 0,
      })
      if (error) throw error

      // A tab képernyője memóriában maradhat. Sikeres mentés után ürítjük,
      // hogy a következő "Új ingatlan" valóban tiszta űrlapot nyisson.
      resetForm()

      Alert.alert(
        status === 'published' ? 'Hirdetés közzétéve' : 'Piszkozat elmentve',
        status === 'published'
          ? 'Az ingatlan már látható a nyilvános oldalon.'
          : 'A hirdetést később folytathatod.',
        [{ text: 'Rendben', onPress: () => router.replace('/dashboard') }]
      )
      if (Platform.OS === 'web') {
        router.replace('/dashboard')
      }
    } catch (error) {
      console.log(error)
      setFormMessage(
        error instanceof Error
          ? error.message
          : 'Nem sikerült elmenteni a hirdetést.'
      )
      Alert.alert('Mentési hiba', 'Nem sikerült elmenteni a hirdetést.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.shell}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={18} color="#38443E" />
          <Text style={styles.backText}>Vissza</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>HIRDETÉSFELADÁS</Text>
          <Text style={styles.heading}>Mutasd meg az ingatlanod legjobb oldalát.</Text>
          <Text style={styles.lead}>
            Töltsd ki az adatokat, nézd át a képeket, majd mentsd piszkozatként vagy tedd közzé.
          </Text>
        </View>

        <View style={[styles.columns, desktop && styles.columnsDesktop]}>
          <View style={[styles.mainColumn, desktop && styles.mainColumnDesktop]}>
            <Section number="01" title="Alapadatok">
              <Field label="Hirdetés címe *" value={title} onChangeText={setTitle} placeholder="Napfényes, erkélyes lakás a belvárosban" />
              <View style={styles.choiceRow}>
                {listingTypes.map((item) => (
                  <Choice key={item} text={item} selected={listingType === item} onPress={() => setListingType(item)} />
                ))}
              </View>
              <Field label="Település, kerület *" value={location} onChangeText={setLocation} placeholder="Budapest, XI. kerület" icon={<MapPin size={18} color="#8B7861" />} />
              <View style={[styles.fieldRow, desktop && styles.fieldRowDesktop]}>
                <View style={styles.flexField}>
                  <Field label="Ár (Ft) *" value={price} onChangeText={setPrice} placeholder="89 900 000" keyboardType="numeric" />
                </View>
                <View style={styles.flexField}>
                  <Field label="Alapterület (m²) *" value={area} onChangeText={setArea} placeholder="78" keyboardType="numeric" />
                </View>
              </View>
              <Text style={styles.label}>Ingatlan típusa</Text>
              <View style={styles.choiceRow}>
                {categories.map((item) => (
                  <Choice key={item} text={item} selected={category === item} onPress={() => setCategory(item)} />
                ))}
              </View>
            </Section>

            <Section number="02" title="Részletek">
              <View style={[styles.fieldRow, desktop && styles.fieldRowDesktop]}>
                <View style={styles.flexField}><Field label="Szobák" value={bedrooms} onChangeText={setBedrooms} placeholder="3" keyboardType="numeric" /></View>
                <View style={styles.flexField}><Field label="Fürdőszobák" value={bathrooms} onChangeText={setBathrooms} placeholder="1" keyboardType="numeric" /></View>
                <View style={styles.flexField}><Field label="Parkolóhely" value={parking} onChangeText={setParking} placeholder="0" keyboardType="numeric" /></View>
              </View>
              <Field label="Bemutatás *" value={description} onChangeText={setDescription} placeholder="Írd le, mitől különleges az ingatlan, milyen a környék és kinek ajánlod..." multiline />
            </Section>

            <Section number="03" title="Fotók">
              <Text style={styles.helper}>Az első kép lesz a hirdetés borítóképe. Maximum 10 fotó tölthető fel.</Text>
              <Pressable onPress={pickImages} disabled={uploadingImages} style={styles.dropzone}>
                {uploadingImages ? <ActivityIndicator color="#9B7141" /> : <Camera size={30} color="#9B7141" />}
                <Text style={styles.dropTitle}>{uploadingImages ? 'Képek feltöltése…' : 'Fotók kiválasztása'}</Text>
                <Text style={styles.dropHint}>Jó fényviszonyú, fekvő képek mutatnak a legjobban.</Text>
              </Pressable>
              {images.length > 0 && (
                <View style={styles.gallery}>
                  {images.map((uri, index) => (
                    <View key={uri} style={styles.thumbWrap}>
                      <Image source={{ uri }} contentFit="cover" style={styles.thumb} />
                      {index === 0 && <Text style={styles.coverLabel}>BORÍTÓ</Text>}
                      <Pressable onPress={() => setImages((current) => current.filter((_, i) => i !== index))} style={styles.remove}>
                        <X size={14} color="#fff" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </Section>
          </View>

          <View style={[styles.sideColumn, desktop && styles.sideColumnDesktop]}>
            <View style={styles.previewCard}>
              {images[0] ? (
                <Image source={{ uri: images[0] }} contentFit="cover" style={styles.previewImage} />
              ) : (
                <View style={styles.previewEmpty}><Home size={34} color="#B79A77" /></View>
              )}
              <View style={styles.previewBody}>
                <Text style={styles.previewTag}>{listingType.toUpperCase()} · {category.toUpperCase()}</Text>
                <Text style={styles.previewTitle}>{title || 'A hirdetésed címe'}</Text>
                <Text style={styles.previewLocation}>{location || 'Helyszín'}</Text>
                <Text style={styles.previewPrice}>
                  {numberFrom(price) > 0 ? `${numberFrom(price).toLocaleString('hu-HU')} Ft` : 'Ár megadása'}
                </Text>
              </View>
            </View>
            <View style={styles.checkCard}>
              <Text style={styles.checkTitle}>Közzététel előtt</Text>
              {['Pontos alapadatok', 'Részletes bemutatás', 'Legalább egy jó minőségű fotó'].map((item) => (
                <View key={item} style={styles.checkRow}><Check size={16} color="#65806F" /><Text style={styles.checkText}>{item}</Text></View>
              ))}
            </View>
            <Pressable onPress={() => save('published')} disabled={saving} style={styles.primaryButton}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Hirdetés közzététele</Text>}
            </Pressable>
            <Pressable onPress={() => save('draft')} disabled={saving} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Mentés piszkozatként</Text>
            </Pressable>
            {formMessage ? (
              <Text role="alert" style={styles.formMessage}>
                {formMessage}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionNumber}>{number}</Text><Text style={styles.sectionTitle}>{title}</Text></View>{children}</View>
}

function Choice({ text, selected, onPress }: { text: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{text}</Text></Pressable>
}

function Field({ label, icon, multiline, ...props }: any) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={[styles.inputWrap, multiline && styles.textareaWrap]}>{icon}<TextInput {...props} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} placeholderTextColor="#A29C93" style={[styles.input, multiline && styles.textarea]} /></View></View>
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F1EB' },
  pageContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 42 : 70, paddingBottom: 150 },
  shell: { width: '100%', maxWidth: 1240, alignSelf: 'center' },
  back: { flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 10 },
  backText: { color: '#38443E', fontWeight: '700' },
  header: { maxWidth: 760, marginTop: 28, marginBottom: 38 },
  eyebrow: { color: '#9B7141', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  heading: { color: '#1D2923', fontSize: Platform.OS === 'web' ? 46 : 36, lineHeight: Platform.OS === 'web' ? 52 : 42, fontWeight: '800', letterSpacing: -1.5, marginTop: 12 },
  lead: { color: '#657069', fontSize: 17, lineHeight: 27, marginTop: 16 },
  columns: { gap: 24 },
  columnsDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  mainColumn: { width: '100%', gap: 22 },
  mainColumnDesktop: { flex: 1 },
  sideColumn: { width: '100%', gap: 14 },
  sideColumnDesktop: { width: 350, position: 'sticky' as any, top: 24 },
  section: { backgroundColor: '#FFFDFC', borderRadius: 24, borderWidth: 1, borderColor: '#E3DED5', padding: 24, gap: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 },
  sectionNumber: { width: 34, height: 34, lineHeight: 34, textAlign: 'center', borderRadius: 17, overflow: 'hidden', backgroundColor: '#F0E5D6', color: '#8B6338', fontWeight: '800' },
  sectionTitle: { color: '#1D2923', fontSize: 22, fontWeight: '800' },
  field: { gap: 8 },
  label: { color: '#354039', fontSize: 14, fontWeight: '700' },
  inputWrap: { minHeight: 58, borderWidth: 1, borderColor: '#D9D4CC', borderRadius: 14, backgroundColor: '#FAF9F6', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  textareaWrap: { minHeight: 150, alignItems: 'flex-start', paddingTop: 15 },
  input: { flex: 1, color: '#1D2923', fontSize: 16, outlineStyle: 'none' as any },
  textarea: { minHeight: 120, lineHeight: 24 },
  fieldRow: { gap: 14 },
  fieldRowDesktop: { flexDirection: 'row' },
  flexField: { flex: 1 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  choice: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: '#D9D4CC', backgroundColor: '#FAF9F6' },
  choiceSelected: { backgroundColor: '#2E4639', borderColor: '#2E4639' },
  choiceText: { color: '#5F6963', fontWeight: '700' },
  choiceTextSelected: { color: '#fff' },
  helper: { color: '#777F79', lineHeight: 22 },
  dropzone: { minHeight: 170, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CDBA9F', borderRadius: 18, backgroundColor: '#FBF7F1', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dropTitle: { color: '#3C493F', fontSize: 17, fontWeight: '800', marginTop: 12 },
  dropHint: { color: '#8A8F8B', marginTop: 6, textAlign: 'center' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { width: 140, height: 100, borderRadius: 12, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  coverLabel: { position: 'absolute', left: 7, bottom: 7, color: '#fff', backgroundColor: '#2E4639', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, fontSize: 9, fontWeight: '800' },
  remove: { position: 'absolute', right: 6, top: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,.65)', alignItems: 'center', justifyContent: 'center' },
  previewCard: { backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#E3DED5' },
  previewImage: { width: '100%', height: 220 },
  previewEmpty: { height: 180, backgroundColor: '#ECE6DC', alignItems: 'center', justifyContent: 'center' },
  previewBody: { padding: 20 },
  previewTag: { color: '#9B7141', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  previewTitle: { color: '#1D2923', fontSize: 22, lineHeight: 27, fontWeight: '800', marginTop: 9 },
  previewLocation: { color: '#79817C', marginTop: 8 },
  previewPrice: { color: '#2E4639', fontSize: 22, fontWeight: '800', marginTop: 18 },
  checkCard: { backgroundColor: '#E8EEE9', borderRadius: 18, padding: 20, gap: 12 },
  checkTitle: { color: '#2E4639', fontWeight: '800', marginBottom: 2 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  checkText: { color: '#56645C', fontSize: 14 },
  primaryButton: { minHeight: 58, borderRadius: 14, backgroundColor: '#2E4639', alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryButton: { minHeight: 56, borderRadius: 14, borderWidth: 1, borderColor: '#CFC8BD', alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: '#455149', fontSize: 15, fontWeight: '800' },
  formMessage: { color: '#A44540', backgroundColor: '#FBE9E7', borderRadius: 12, padding: 13, fontSize: 13, lineHeight: 19, textAlign: 'center' },
})
