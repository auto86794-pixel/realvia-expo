import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { CalendarDays, CheckCircle2, Info, Phone, X } from 'lucide-react-native'

import { supabase } from '@/src/services/supabase'

interface Props {
  visible: boolean
  onClose: () => void
  propertyId: number
  propertyTitle: string
  propertyOwnerId?: string
  soldProperty?: boolean
}

const inquiryTypes = [
  { value: 'viewing', label: 'Megtekinteném', icon: CalendarDays },
  { value: 'callback', label: 'Visszahívást kérek', icon: Phone },
  { value: 'information', label: 'Információt kérek', icon: Info },
]

export default function InquiryModal({
  visible,
  onClose,
  propertyId,
  propertyTitle,
  propertyOwnerId,
  soldProperty = false,
}: Props) {
  const { width } = useWindowDimensions()
  const compact = width < 640
  const [type, setType] = useState('viewing')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredTimeOne, setPreferredTimeOne] = useState('')
  const [preferredTimeTwo, setPreferredTimeTwo] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (visible) {
      setType(soldProperty ? 'information' : 'viewing')
    } else {
      setErrorText('')
      setSent(false)
    }
  }, [soldProperty, visible])

  function resetAndClose() {
    setType(soldProperty ? 'information' : 'viewing')
    setName('')
    setEmail('')
    setPhone('')
    setPreferredTimeOne('')
    setPreferredTimeTwo('')
    setMessage('')
    setErrorText('')
    setSent(false)
    onClose()
  }

  async function submitInquiry() {
    setErrorText('')
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!cleanName || !cleanEmail || !cleanPhone) {
      setErrorText('A név, az email-cím és a telefonszám megadása kötelező.')
      return
    }

    if (!emailRegex.test(cleanEmail)) {
      setErrorText('Kérlek, érvényes email-címet adj meg.')
      return
    }

    if (type === 'viewing' && !preferredTimeOne.trim()) {
      setErrorText('Megtekintéshez adj meg legalább egy megfelelő időpontot.')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.from('inquiries').insert({
        property_id: propertyId,
        property_title: propertyTitle,
        owner_id: propertyOwnerId,
        inquiry_type: type,
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_phone: cleanPhone,
        preferred_time_one: preferredTimeOne.trim(),
        preferred_time_two: preferredTimeTwo.trim(),
        message: message.trim(),
        status: 'new',
      })

      if (error) throw error
      setSent(true)
    } catch (error) {
      console.error('Inquiry submission failed:', error)
      setErrorText('Az érdeklődést most nem sikerült elküldeni. Próbáld újra néhány pillanat múlva.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, compact && styles.modalCompact]}>
          <Pressable onPress={resetAndClose} style={styles.closeButton}>
            <X size={20} color="#425148" />
          </Pressable>

          {sent ? (
            <View style={styles.success}>
              <View style={styles.successIcon}><CheckCircle2 size={38} color="#FFFFFF" /></View>
              <Text style={styles.successTitle}>Az érdeklődésed megérkezett</Text>
              <Text style={styles.successText}>A hirdető megkapta a megkeresésedet, és a megadott elérhetőségeiden tud válaszolni.</Text>
              <Pressable onPress={resetAndClose} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Rendben</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
              <Text style={styles.eyebrow}>KAPCSOLAT A HIRDETŐVEL</Text>
              <Text style={styles.title}>{soldProperty ? 'Hasonló otthont keresel?' : 'Miben segíthetünk?'}</Text>
              <Text style={styles.propertyTitle} numberOfLines={2}>{propertyTitle}</Text>

              {soldProperty ? (
                <View style={styles.soldNotice}>
                  <Text style={styles.soldNoticeText}>Ez az ingatlan már elkelt, de a hirdető felveheti veled a kapcsolatot hasonló lehetőségekkel.</Text>
                </View>
              ) : <View style={[styles.typeGrid, compact && styles.typeGridCompact]}>
                {inquiryTypes.map((item) => {
                  const Icon = item.icon
                  const selected = type === item.value
                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => setType(item.value)}
                      style={[styles.typeButton, selected && styles.typeButtonSelected]}
                    >
                      <Icon size={19} color={selected ? '#FFFFFF' : '#6D7A72'} />
                      <Text style={[styles.typeText, selected && styles.typeTextSelected]}>{item.label}</Text>
                    </Pressable>
                  )
                })}
              </View>}

              <View style={[styles.row, compact && styles.rowCompact]}>
                <Field label="Név *" value={name} onChangeText={setName} placeholder="Teljes név" />
                <Field label="Telefonszám *" value={phone} onChangeText={setPhone} placeholder="+36 30 123 4567" keyboardType="phone-pad" />
              </View>
              <Field label="Email-cím *" value={email} onChangeText={setEmail} placeholder="email@pelda.hu" keyboardType="email-address" autoCapitalize="none" />

              {type === 'viewing' && (
                <View style={styles.timeBox}>
                  <Text style={styles.timeTitle}>Mikor lenne megfelelő?</Text>
                  <Text style={styles.timeHelp}>Adj meg egy vagy két lehetséges időpontot. A hirdető ezek alapján egyeztet veled.</Text>
                  <View style={[styles.row, compact && styles.rowCompact]}>
                    <Field label="Első időpont *" value={preferredTimeOne} onChangeText={setPreferredTimeOne} placeholder="pl. péntek 17:00" />
                    <Field label="Második időpont" value={preferredTimeTwo} onChangeText={setPreferredTimeTwo} placeholder="pl. szombat 10:00" />
                  </View>
                </View>
              )}

              <Field
                label="Üzenet"
                value={message}
                onChangeText={setMessage}
                placeholder={
                  soldProperty
                    ? 'Írd le röviden, milyen hasonló ingatlant keresel.'
                    : type === 'callback'
                    ? 'Mikor hívhat a hirdető?'
                    : type === 'information'
                      ? 'Milyen információra vagy kíváncsi?'
                      : 'Van valamilyen kérdésed a megtekintés előtt?'
                }
                multiline
              />

              {!!errorText && <Text style={styles.error}>{errorText}</Text>}

              <Pressable onPress={submitInquiry} disabled={loading} style={[styles.primaryButton, loading && styles.buttonDisabled]}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Megkeresés elküldése</Text>}
              </Pressable>
              <Text style={styles.privacy}>Az adataidat kizárólag az adott ingatlan hirdetője kapja meg kapcsolatfelvétel céljából.</Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  )
}

function Field({ label, multiline, ...props }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor="#999E9A"
        style={[styles.input, multiline && styles.textarea]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(24,35,29,0.58)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  modal: { width: '100%', maxWidth: 760, maxHeight: '92%', backgroundColor: '#F8F5EF', borderRadius: 28, overflow: 'hidden', ...Platform.select({ web: { boxShadow: '0 25px 80px rgba(20,30,24,.28)' } as any, default: {} }) },
  modalCompact: { maxHeight: '95%', borderRadius: 22 },
  closeButton: { position: 'absolute', zIndex: 5, right: 18, top: 18, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1DCD4', alignItems: 'center', justifyContent: 'center' },
  form: { padding: 30, paddingTop: 35 },
  eyebrow: { color: '#9A7040', fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: '#1D2923', fontSize: 32, fontWeight: '800', letterSpacing: -0.8, marginTop: 8, paddingRight: 50 },
  propertyTitle: { color: '#6E7872', fontSize: 15, lineHeight: 21, marginTop: 7, paddingRight: 45 },
  typeGrid: { flexDirection: 'row', gap: 9, marginTop: 24 },
  typeGridCompact: { flexDirection: 'column' },
  typeButton: { flex: 1, minHeight: 58, borderRadius: 14, borderWidth: 1, borderColor: '#DBD5CC', backgroundColor: '#FFFDFC', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 11 },
  typeButtonSelected: { backgroundColor: '#2E4B3C', borderColor: '#2E4B3C' },
  typeText: { color: '#536058', fontSize: 13, fontWeight: '800' },
  typeTextSelected: { color: '#FFFFFF' },
  soldNotice: { marginTop: 20, borderRadius: 15, backgroundColor: '#FCEBE9', borderWidth: 1, borderColor: '#F3D1CE', padding: 15 },
  soldNoticeText: { color: '#88413D', fontSize: 13, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 12 },
  rowCompact: { flexDirection: 'column' },
  field: { flex: 1, marginTop: 17 },
  label: { color: '#3D4942', fontSize: 13, fontWeight: '800', marginBottom: 7 },
  input: { minHeight: 54, borderRadius: 13, borderWidth: 1, borderColor: '#D8D2C9', backgroundColor: '#FFFDFC', color: '#1D2923', paddingHorizontal: 15, fontSize: 15, outlineStyle: 'none' as any },
  textarea: { minHeight: 105, paddingTop: 14, lineHeight: 22 },
  timeBox: { marginTop: 18, borderRadius: 17, backgroundColor: '#EAF0EB', padding: 17 },
  timeTitle: { color: '#2E4639', fontSize: 16, fontWeight: '800' },
  timeHelp: { color: '#6B776F', fontSize: 13, lineHeight: 19, marginTop: 4 },
  error: { color: '#A64D49', backgroundColor: '#FCEBE9', borderRadius: 11, padding: 12, textAlign: 'center', fontSize: 13, lineHeight: 18, marginTop: 15 },
  primaryButton: { minHeight: 57, borderRadius: 14, backgroundColor: '#2E4B3C', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  buttonDisabled: { opacity: 0.65 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 0.2 },
  privacy: { color: '#8A918C', textAlign: 'center', fontSize: 11, lineHeight: 16, marginTop: 11 },
  success: { padding: 42, alignItems: 'center' },
  successIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#2E4B3C', alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: '#1D2923', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 23 },
  successText: { color: '#68736C', fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 490, marginTop: 10 },
})
