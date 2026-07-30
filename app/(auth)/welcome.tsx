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
  // Egyes mobilböngészők fizikai pixelszélességet adnak vissza, ezért
  // az álló képarányt is figyeljük. Így biztosan a portré háttér töltődik be.
  const mobile = width < 768 || height > width * 1.25
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
      source={mobile
        ? require('../../assets/images/realvia-welcome-family-mobile.png')
        : require('../../assets/images/realvia-welcome-family-light.png')}
      resizeMode="cover"
      style={[styles.background, { minHeight: height }]}
    >
      <LinearGradient
        colors={mobile
          ? ['rgba(255,252,245,0)', 'rgba(249,241,226,0.04)', 'rgba(239,225,202,0.72)']
          : ['rgba(255,252,245,0.02)', 'rgba(255,248,236,0.10)', 'rgba(239,225,202,0.48)']}
        locations={[0, mobile ? 0.55 : 0.48, 1]}
        style={[styles.overlay, mobile && styles.overlayMobile, { minHeight: height }]}
      >
        <Animated.View entering={FadeInDown.springify()} style={[styles.panel, mobile && styles.panelMobile]}>
          <View style={[styles.mark, mobile && styles.markMobile]}><Text style={[styles.markText, mobile && styles.markTextMobile]}>R</Text></View>
          <Text style={[styles.brand, mobile && styles.brandMobile]}>REALVIA</Text>
          <Text style={[styles.kicker, mobile && styles.kickerMobile]}>EGY LÉPÉSSEL KÖZELEBB AZ OTTHONODHOZ</Text>
          <View style={[styles.rule, mobile && styles.ruleMobile]} />
          <Text style={[styles.description, mobile && styles.descriptionMobile]}>
            Fedezd fel a hozzád illő otthont, vagy mutasd meg saját ingatlanodat.
          </Text>
          <View style={[styles.actions, mobile && styles.actionsMobile]}>
            <Pressable onPress={() => router.push('/login')} style={[styles.primary, mobile && styles.buttonMobile]}>
              <Text style={styles.primaryText}>BELÉPÉS</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/register')} style={[styles.secondary, mobile && styles.secondaryMobile, mobile && styles.buttonMobile]}>
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
  panel: { width: '100%', maxWidth: 470, alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  panelMobile: { maxWidth: 440, paddingHorizontal: 12, paddingVertical: 8 },
  mark: { width: 48, height: 48, borderWidth: 1, borderColor: '#9B7141', alignItems: 'center', justifyContent: 'center' },
  markMobile: { width: 40, height: 40 },
  markText: { color: '#73502D', fontSize: 29, fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : 'serif' },
  markTextMobile: { fontSize: 24 },
  brand: { color: '#1D2923', fontSize: 53, fontWeight: '400', letterSpacing: 5, marginTop: 13, fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : 'serif' },
  brandMobile: { fontSize: 34, marginTop: 9, letterSpacing: 4 },
  kicker: { color: '#8B6338', fontSize: 12, lineHeight: 18, fontWeight: '800', letterSpacing: 1.4, textAlign: 'center', marginTop: 7 },
  kickerMobile: { fontSize: 10, lineHeight: 15, letterSpacing: 1.1, marginTop: 5 },
  rule: { width: 48, height: 1, backgroundColor: '#CDBA9F', marginVertical: 14 },
  ruleMobile: { marginVertical: 10 },
  description: { color: '#627068', fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 370 },
  descriptionMobile: { color: '#4F5F56', fontSize: 14, lineHeight: 20, maxWidth: 330 },
  actions: { width: '100%', gap: 9, marginTop: 20 },
  actionsMobile: { gap: 7, marginTop: 14 },
  primary: { minHeight: 56, borderRadius: 14, backgroundColor: '#2E4639', alignItems: 'center', justifyContent: 'center' },
  buttonMobile: { minHeight: 49, borderRadius: 13 },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },
  secondary: { minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: '#BCA98E', backgroundColor: 'rgba(255,255,255,.45)', alignItems: 'center', justifyContent: 'center' },
  secondaryMobile: { backgroundColor: 'rgba(111,82,52,0.13)', borderColor: '#A98257' },
  secondaryText: { color: '#61482F', fontSize: 14, fontWeight: '800', letterSpacing: 1.2 },
  guest: { alignItems: 'center', paddingTop: 8, paddingBottom: 2 },
  guestText: { color: '#65736B', fontSize: 14, fontWeight: '600' },
  guestError: { color: '#A64D49', fontSize: 12, lineHeight: 17, textAlign: 'center' },
})
