import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'

type Props = {
  mode: 'login' | 'register'
  email: string
  password: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
  onSwitch: () => void
  loading: boolean
  message?: string
  success?: boolean
}

export default function AuthScreen(props: Props) {
  const { width, height } = useWindowDimensions()
  const mobile = width < 768
  const login = props.mode === 'login'

  return (
    <ImageBackground
      source={require('../../assets/images/realvia-welcome-sunrise.png')}
      resizeMode="cover"
      style={[styles.background, { minHeight: height }]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, minHeight: height }}
      >
        <LinearGradient
          colors={['rgba(255,250,240,0.03)', 'rgba(37,51,43,0.16)', 'rgba(26,38,31,0.52)']}
          locations={[0, 0.52, 1]}
          style={styles.overlay}
        >
          <Animated.View
            entering={FadeInDown.springify()}
            style={[styles.card, mobile && styles.cardMobile]}
          >
            <View style={styles.mark}><Text style={styles.markText}>R</Text></View>
            <Text style={styles.eyebrow}>{login ? 'ÜDV ÚJRA' : 'CSATLAKOZZ HOZZÁNK'}</Text>
            <Text style={[styles.title, mobile && styles.titleMobile]}>
              {login ? 'Belépés a Realviába' : 'Hozd létre a fiókodat'}
            </Text>
            <Text style={styles.subtitle}>
              {login
                ? 'Kezeld a hirdetéseidet, a mentett otthonokat és az érdeklődéseket egy helyen.'
                : 'Adj fel saját ingatlanhirdetést, ments otthonokat és kezeld az érdeklődéseidet.'}
            </Text>

            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Email cím</Text>
                <TextInput
                  value={props.email}
                  onChangeText={props.onEmailChange}
                  placeholder="email@pelda.hu"
                  placeholderTextColor="#9A9E99"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  style={styles.input}
                />
              </View>
              <View>
                <Text style={styles.label}>Jelszó</Text>
                <TextInput
                  value={props.password}
                  onChangeText={props.onPasswordChange}
                  placeholder="Legalább 8 karakter"
                  placeholderTextColor="#9A9E99"
                  secureTextEntry
                  autoComplete="password"
                  style={styles.input}
                />
              </View>

              <Pressable onPress={props.onSubmit} disabled={props.loading} style={[styles.primary, props.loading && styles.disabled]}>
                {props.loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{login ? 'Belépés' : 'Regisztráció'}</Text>}
              </Pressable>

              {props.message ? (
                <Text role="alert" style={[styles.message, props.success && styles.success]}>{props.message}</Text>
              ) : null}

              <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>VAGY</Text><View style={styles.line} /></View>
              <Pressable onPress={props.onSwitch} style={styles.secondary}>
                <Text style={styles.secondaryText}>{login ? 'Új fiók létrehozása' : 'Már van fiókom'}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </LinearGradient>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', backgroundColor: '#E9E1D4' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: Platform.OS === 'web' ? 48 : 30 },
  card: { width: '100%', maxWidth: 520, backgroundColor: 'rgba(251,248,241,0.94)', borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,.78)', padding: 36, shadowColor: '#1F2F27', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.2, shadowRadius: 38, elevation: 16 },
  cardMobile: { padding: 24, borderRadius: 23 },
  mark: { width: 42, height: 42, borderWidth: 1, borderColor: '#9B7141', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  markText: { color: '#73502D', fontSize: 25, fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : 'serif' },
  eyebrow: { color: '#9B7141', fontSize: 11, fontWeight: '800', letterSpacing: 2, textAlign: 'center', marginTop: 18 },
  title: { color: '#1D2923', fontSize: 38, lineHeight: 44, fontWeight: '800', letterSpacing: -1, textAlign: 'center', marginTop: 8 },
  titleMobile: { fontSize: 31, lineHeight: 37 },
  subtitle: { color: '#68736C', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10 },
  form: { gap: 16, marginTop: 27 },
  label: { color: '#39453E', fontSize: 13, fontWeight: '800', marginBottom: 8 },
  input: { minHeight: 56, borderRadius: 14, borderWidth: 1, borderColor: '#D8D2C9', backgroundColor: '#FFFDFC', color: '#1D2923', fontSize: 16, paddingHorizontal: 17, outlineStyle: 'none' as any },
  primary: { minHeight: 56, borderRadius: 14, backgroundColor: '#2E4639', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  disabled: { opacity: 0.65 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  message: { color: '#A44540', fontSize: 13, lineHeight: 19, textAlign: 'center', backgroundColor: '#FBE9E7', borderRadius: 10, padding: 11 },
  success: { color: '#3F7550', backgroundColor: '#E6F1E9' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  line: { height: 1, backgroundColor: '#DED8CF', flex: 1 },
  or: { color: '#9A9E99', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  secondary: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: '#BCA98E', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#61482F', fontSize: 14, fontWeight: '800' },
})
