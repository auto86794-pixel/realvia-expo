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
import { supabase } from '@/src/services/supabase'

export default function Welcome() {
  const { width, height } = useWindowDimensions()
  const mobile = width < 768
  const [guestLoading, setGuestLoading] = useState(false)
  const [guestError, setGuestError] = useState('')

  async function browseAsGuest() {
    try {
      setGuestLoading(true)
      setGuestError('')
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      const { data } = await supabase.auth.getSession({ forceFetch: true })
      if (data?.session) throw new Error('A munkamenet még aktív.')

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
      source={require('../../assets/images/realvia-welcome-sunrise.png')}
      resizeMode="cover"
      style={[styles.background, { minHeight: height }]}
    >
      <LinearGradient
        colors={['rgba(255,250,240,0.05)', 'rgba(35,48,40,0.18)', 'rgba(24,35,29,0.60)']}
        locations={[0, 0.5, 1]}
        style={[styles.overlay, { minHeight: height }]}
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
  overlay: { flex: 1, width: '100%', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 20, paddingVertical: Platform.OS === 'web' ? 42 : 28 },
  panel: { width: '100%', maxWidth: 500, alignItems: 'center', backgroundColor: 'rgba(251,248,241,0.92)', borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.72)', paddingHorizontal: 38, paddingVertical: 34, shadowColor: '#1F2F27', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 35, elevation: 14 },
  panelMobile: { paddingHorizontal: 24, paddingVertical: 28, borderRadius: 24 },
  mark: { width: 48, height: 48, borderWidth: 1, borderColor: '#9B7141', alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#73502D', fontSize: 29, fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : 'serif' },
  brand: { color: '#1D2923', fontSize: 53, fontWeight: '400', letterSpacing: 5, marginTop: 13, fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : 'serif' },
  brandMobile: { fontSize: 42 },
  kicker: { color: '#8B6338', fontSize: 12, lineHeight: 18, fontWeight: '800', letterSpacing: 1.4, textAlign: 'center', marginTop: 7 },
  rule: { width: 48, height: 1, backgroundColor: '#CDBA9F', marginVertical: 17 },
  description: { color: '#627068', fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 370 },
  actions: { width: '100%', gap: 11, marginTop: 24 },
  primary: { minHeight: 56, borderRadius: 14, backgroundColor: '#2E4639', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },
  secondary: { minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: '#BCA98E', backgroundColor: 'rgba(255,255,255,.45)', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#61482F', fontSize: 14, fontWeight: '800', letterSpacing: 1.2 },
  guest: { alignItems: 'center', paddingTop: 8, paddingBottom: 2 },
  guestText: { color: '#65736B', fontSize: 14, fontWeight: '600' },
  guestError: { color: '#A64D49', fontSize: 12, lineHeight: 17, textAlign: 'center' },
})
