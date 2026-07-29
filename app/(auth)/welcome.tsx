import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useAuth } from '@/src/providers/AuthProvider'

export default function Welcome() {
  const { width, height } = useWindowDimensions()
  const { signOut } = useAuth()
  const mobile = width < 768
  const [guestLoading, setGuestLoading] = useState(false)
  const [guestError, setGuestError] = useState('')

  async function browseAsGuest() {
    try {
      setGuestLoading(true)
      setGuestError('')
      await signOut()
      router.replace('/(tabs)')
    } catch (error) {
      console.error('Guest sign-out failed:', error)
      setGuestError('A vendég mód indítása nem sikerült. Próbáld újra, vagy nyisd meg az oldalt privát ablakban.')
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/images/realvia-welcome-family-light.png')}
      resizeMode="cover"
      style={[styles.background, { minHeight: height }]}
    >
      <LinearGradient
        colors={['rgba(255,252,245,0.02)', 'rgba(255,248,236,0.05)', 'rgba(38,51,43,0.20)']}
        locations={[0, 0.58, 1]}
        style={[styles.overlay, mobile && styles.overlayMobile, { minHeight: height }]}
      >
        <Animated.View entering={FadeInDown.springify()} style={[styles.panel, mobile && styles.panelMobile]}>
          <View style={styles.mark}><Text style={styles.markText}>R</Text></View>
          <Text style={[styles.brand, mobile && styles.brandMobile]}>REALVIA</Text>
          <Text style={styles.kicker}>EGY LÉPÉSSEL KÖZELEBB AZ OTTHONODHOZ</Text>
          <View style={styles.rule} />
          <Text style={styles.description}>
            Fedezd fel a hozzád illő otthont, vagy mutasd meg saját ingatlanodat.
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={() => router.push('/login')} style={styles.primary}>
              <Text style={styles.primaryText}>BELÉPÉS</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/register')} style={styles.secondary}>
              <Text style={styles.secondaryText}>REGISZTRÁCIÓ</Text>
            </Pressable>
            <Pressable onPress={browseAsGuest} disabled={guestLoading} style={styles.guest}>
              {guestLoading ? <ActivityIndicator size="small" color="#65736B" /> : <Text style={styles.guestText}>Böngészés vendégként →</Text>}
            </Pressable>
            {!!guestError && <Text style={styles.guestError}>{guestError}</Text>}
          </View>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', backgroundColor: '#E9E1D4' },
  overlay: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'flex-start', paddingHorizontal: Platform.OS === 'web' ? '7%' : 20, paddingVertical: Platform.OS === 'web' ? 42 : 28 },
  overlayMobile: { justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 22 },
  panel: { width: '100%', maxWidth: 470, alignItems: 'center', backgroundColor: 'rgba(251,248,241,0.94)', borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.82)', paddingHorizontal: 36, paddingVertical: 31, shadowColor: '#1F2F27', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.16, shadowRadius: 35, elevation: 14 },
  panelMobile: { maxWidth: 440, paddingHorizontal: 22, paddingVertical: 23, borderRadius: 24 },
  mark: { width: 48, height: 48, borderWidth: 1, borderColor: '#9B7141', alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#73502D', fontSize: 29, fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : 'serif' },
  brand: { color: '#1D2923', fontSize: 53, fontWeight: '400', letterSpacing: 5, marginTop: 13, fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : 'serif' },
  brandMobile: { fontSize: 38 },
  kicker: { color: '#8B6338', fontSize: 12, lineHeight: 18, fontWeight: '800', letterSpacing: 1.4, textAlign: 'center', marginTop: 7 },
  rule: { width: 48, height: 1, backgroundColor: '#CDBA9F', marginVertical: 14 },
  description: { color: '#627068', fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 370 },
  actions: { width: '100%', gap: 9, marginTop: 20 },
  primary: { minHeight: 56, borderRadius: 14, backgroundColor: '#2E4639', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },
  secondary: { minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: '#BCA98E', backgroundColor: 'rgba(255,255,255,.45)', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#61482F', fontSize: 14, fontWeight: '800', letterSpacing: 1.2 },
  guest: { alignItems: 'center', paddingTop: 8, paddingBottom: 2 },
  guestText: { color: '#65736B', fontSize: 14, fontWeight: '600' },
  guestError: { color: '#A64D49', fontSize: 12, lineHeight: 17, textAlign: 'center' },
})
