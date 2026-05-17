import { useState } from 'react'

import {
  Alert,
  ImageBackground,
  Pressable,
  Text,
  TextInput
} from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { router } from 'expo-router'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import { supabase } from '../../src/services/supabase'

export default function LoginScreen() {
  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  async function handleLogin() {
    const { error } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      )

    if (error) {
      Alert.alert(error.message)
      return
    }

    router.replace('/(tabs)' as any)
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
          'rgba(0,0,0,0.30)',
          'rgba(0,0,0,0.92)',
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

            maxWidth: 520,

            alignSelf: 'center',

            marginBottom: 26,
          }}
        >
          <Text
            style={{
              color: 'white',

              fontSize: 44,

              fontWeight: '800',

              letterSpacing: -1.5,

              textAlign: 'center',
            }}
          >
            Welcome Back
          </Text>

          <Text
            style={{
              color: '#D4D4D8',

              fontSize: 16,

              marginTop: 12,

              lineHeight: 25,

              textAlign: 'center',
            }}
          >
            Access curated luxury
            properties and premium
            living experiences.
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
              'rgba(20,20,20,0.70)',

            borderRadius: 36,

            borderWidth: 1,

            borderColor:
              'rgba(255,255,255,0.08)',

            padding: 24,

            gap: 18,

            overflow: 'hidden',
          }}
        >
          <TextInput
            placeholder="Email"

            placeholderTextColor="#71717A"

            value={email}

            onChangeText={setEmail}

            autoCapitalize="none"

            style={{
              backgroundColor:
                'rgba(255,255,255,0.04)',

              borderRadius: 22,

              borderWidth: 1,

              borderColor:
                'rgba(255,255,255,0.05)',

              paddingHorizontal: 20,

              paddingVertical: 18,

              color: 'white',

              fontSize: 16,
            }}
          />

          <TextInput
            placeholder="Password"

            placeholderTextColor="#71717A"

            secureTextEntry

            value={password}

            onChangeText={setPassword}

            style={{
              backgroundColor:
                'rgba(255,255,255,0.04)',

              borderRadius: 22,

              borderWidth: 1,

              borderColor:
                'rgba(255,255,255,0.05)',

              paddingHorizontal: 20,

              paddingVertical: 18,

              color: 'white',

              fontSize: 16,
            }}
          />

          <Pressable
            onPress={handleLogin}
            style={{
              backgroundColor:
                '#D6B07B',

              paddingVertical: 20,

              borderRadius: 24,

              alignItems: 'center',

              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: '#000000',

                fontSize: 17,

                fontWeight: '800',

                letterSpacing: 1,
              }}
            >
              BELÉPÉS
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push(
                '/register'
              )
            }
            style={{
              paddingVertical: 18,

              borderRadius: 24,

              alignItems: 'center',

              borderWidth: 1,

              borderColor:
                'rgba(255,255,255,0.08)',

              backgroundColor:
                'rgba(255,255,255,0.03)',
            }}
          >
            <Text
              style={{
                color: 'white',

                fontSize: 16,

                fontWeight: '700',

                letterSpacing: 0.5,
              }}
            >
              REGISZTRÁCIÓ
            </Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  )
}