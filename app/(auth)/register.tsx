import { useState } from 'react'

import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { router } from 'expo-router'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import { supabase } from '../../src/services/supabase'

import {
  Colors,
  Radius,
  Shadows,
} from '@/constants/theme'

export default function RegisterScreen() {
  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  async function handleRegister() {
    try {
      if (!email || !password) {
        Alert.alert(
          'Hiányzó adatok',
          'Add meg az email címet és a jelszót.'
        )

        return
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (
        !emailRegex.test(
          email.trim()
        )
      ) {
        Alert.alert(
          'Érvénytelen email',
          'Adj meg egy valós email címet.'
        )

        return
      }

      if (password.length < 8) {
        Alert.alert(
          'Gyenge jelszó',
          'A jelszónak legalább 8 karakterből kell állnia.'
        )

        return
      }

      setLoading(true)

      const { error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

      if (error) {
        Alert.alert(
          'Sikertelen regisztráció',
          error.message
        )

        return
      }

      Alert.alert(
        'Sikeres regisztráció',
        'Ellenőrizd az emailedet és erősítsd meg a regisztrációt.'
      )

      router.replace('/login')
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'Váratlan hiba történt.'
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
      }}
      resizeMode="cover"
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
                Platform.OS === 'web'
                  ? 62
                  : 44,
              fontWeight: '900',
              letterSpacing: -2.5,
              textAlign: 'center',
            }}
          >
            Csatlakozz a Realviához
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
            Hozd létre prémium
            ingatlan fiókodat és
            kezdd el építeni portfóliódat.
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
            onPress={handleRegister}
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
                  color: '#000',
                  fontSize: 17,
                  fontWeight: '900',
                  letterSpacing: 0.5,
                }}
              >
                Regisztráció
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() =>
              router.push('/login')
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
              Már van fiókom
            </Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
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