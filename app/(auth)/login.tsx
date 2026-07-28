import { useState } from 'react'

import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { router } from 'expo-router'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import { supabase } from '../../src/services/supabase'
import { useAuth } from '../../src/providers/AuthProvider'

import {
  Colors,
  Radius,
  Shadows,
} from '@/constants/theme'

export default function LoginScreen() {
  const { refreshSession } = useAuth()
  const { width, height } =
    useWindowDimensions()
  const isMobile = width < 768

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)
  const [message, setMessage] =
    useState('')

  async function handleLogin() {
    try {
      setMessage('')

      if (!email || !password) {
        setMessage(
          'Add meg az email címed és a jelszavad.'
        )
        Alert.alert(
          'Hiányzó adatok',
          'Add meg az email címed és a jelszavad.'
        )

        return
      }

      setLoading(true)

      const { error } =
        await supabase.auth.signInWithPassword(
          {
            email: email.trim(),
            password,
          }
        )

      if (error) {
        setMessage(
          'Sikertelen belépés. Ellenőrizd az email címet, a jelszót és hogy megerősítetted-e az emailedet.'
        )
        Alert.alert(
          'Sikertelen belépés',
          'Ellenőrizd az email címet és a jelszót.'
        )

        return
      }

      const activeSession =
        await refreshSession()

      if (!activeSession?.user) {
        setMessage(
          'A belépés sikerült, de a munkamenet nem indult el. Frissítsd az oldalt, majd próbáld újra.'
        )
        return
      }

      router.replace('/(tabs)' as any)
    } catch (error) {
      console.log(error)
      setMessage(
        'Váratlan hiba történt. Ellenőrizd az internetkapcsolatot, majd próbáld újra.'
      )

      Alert.alert(
        'Hiba',
        'Váratlan hiba történt belépés közben.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/images/realvia-welcome.png')}
      style={{
        flex: 1,
        width: '100%',
        minHeight: height,
        backgroundColor: '#05060A',
      }}
      imageStyle={{
        width: '100%',
        height: '100%',
      }}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          minHeight: height,
        }}
        keyboardShouldPersistTaps="handled"
      >
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.20)',
          'rgba(0,0,0,0.94)',
        ]}
        style={{
          flex: 1,

          justifyContent:
            'center',

          alignItems: 'center',

          paddingHorizontal: 24,

          paddingVertical: 54,
          width: '100%',
          minHeight: height,
        }}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            width: '100%',

            maxWidth: 560,

            alignSelf: 'center',

            marginBottom: 28,
          }}
        >
          <Text
            style={{
              color: 'white',

              fontSize:
                isMobile ? 42 : 62,

              fontWeight: '900',

              letterSpacing: -2.5,

              textAlign: 'center',
            }}
          >
            Üdv újra a Realviánál
          </Text>

          <Text
            style={{
              color: '#D4D4D8',

              fontSize:
                Platform.OS === 'web'
                  ? 18
                  : 16,

              marginTop: 16,

              lineHeight: 28,

              textAlign: 'center',
            }}
          >
            Jelentkezz be, és kezeld
            prémium ingatlan portfóliódat.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(
            120
          ).springify()}
          style={{
            width: '100%',

            maxWidth: 520,

            alignSelf: 'center',

            backgroundColor:
              'rgba(20,20,20,0.72)',

            borderRadius:
              Radius.xl,

            borderWidth: 1,

            borderColor:
              'rgba(255,255,255,0.08)',

            padding: 26,

            gap: 18,

            overflow: 'hidden',

            ...Shadows.luxury,
          }}
        >
          <View>
            <Text style={labelStyle}>
              Email cím
            </Text>

            <TextInput
              placeholder="email@pelda.hu"
              placeholderTextColor="#71717A"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={inputStyle}
            />
          </View>

          <View>
            <Text style={labelStyle}>
              Jelszó
            </Text>

            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#71717A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoComplete="password"
              style={inputStyle}
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor:
                Colors.dark.primary,

              paddingVertical: 20,

              borderRadius:
                Radius.full,

              alignItems: 'center',

              marginTop: 10,

              opacity: loading
                ? 0.7
                : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator
                color="#000"
              />
            ) : (
              <Text
                style={{
                  color: '#000000',

                  fontSize: 17,

                  fontWeight: '900',

                  letterSpacing: 0.5,
                }}
              >
                Belépés
              </Text>
            )}
          </Pressable>

          {message ? (
            <Text
              role="alert"
              style={{
                color: '#FFD6D6',
                fontSize: 14,
                lineHeight: 21,
                textAlign: 'center',
              }}
            >
              {message}
            </Text>
          ) : null}

          <Pressable
            onPress={() =>
              router.push('/register')
            }
            style={{
              paddingVertical: 18,

              borderRadius:
                Radius.full,

              alignItems: 'center',

              borderWidth: 1,

              borderColor:
                'rgba(255,255,255,0.08)',

              backgroundColor:
                'rgba(255,255,255,0.04)',
            }}
          >
            <Text
              style={{
                color: 'white',

                fontSize: 16,

                fontWeight: '800',
              }}
            >
              Fiók létrehozása
            </Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
      </ScrollView>
    </ImageBackground>
  )
}

const labelStyle = {
  color: '#D1D5DB',
  fontSize: 14,
  fontWeight: '700' as const,
  marginBottom: 10,
}

const inputStyle = {
  backgroundColor:
    'rgba(255,255,255,0.05)',

  borderRadius: 22,

  borderWidth: 1,

  borderColor:
    'rgba(255,255,255,0.06)',

  paddingHorizontal: 20,

  paddingVertical: 18,

  color: 'white',

  fontSize: 16,
}
