import {
  ImageBackground,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { router } from 'expo-router'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

export default function Welcome() {
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
          'rgba(0,0,0,0.25)',
          'rgba(0,0,0,0.94)',
        ]}
        style={{
          flex: 1,

          justifyContent:
            'flex-end',

          paddingHorizontal: 28,

          paddingBottom: 54,
        }}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            marginBottom: 42,

            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 54,
              height: 54,

              borderWidth: 1,

              borderColor:
                'rgba(230,201,152,0.85)',

              justifyContent:
                'center',

              alignItems: 'center',

              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: '#F2E6CF',

                fontSize: 34,

                fontWeight: '400',

                letterSpacing: 1,

                fontFamily:
                  Platform.OS ===
                  'ios'
                    ? 'Didot'
                    : Platform.OS ===
                      'android'
                    ? 'serif'
                    : 'Didot, serif',
              }}
            >
              R
            </Text>
          </View>

          <Text
            style={{
              color: '#F2E6CF',

              fontSize: 64,

              fontWeight: '300',

              letterSpacing: 3,

              textAlign: 'center',

              fontFamily:
                Platform.OS ===
                'ios'
                  ? 'Didot'
                  : Platform.OS ===
                    'android'
                  ? 'serif'
                  : 'Didot, serif',

              marginBottom: 8,
            }}
          >
            REALVIA
          </Text>

          <Text
            style={{
              color: '#E8D3AE',

              fontSize: 18,

              fontWeight: '600',

              letterSpacing: 1.2,

              textAlign: 'center',

              marginTop: 10,
            }}
          >
            EGY LÉPÉSSEL KÖZELEBB AZ OTTHONODHOZ 
          </Text>

          <View
            style={{
              flexDirection: 'row',

              alignItems: 'center',

              marginTop: 18,

              marginBottom: 18,
            }}
          >
            <View
              style={{
                height: 1,

                width: 42,

                backgroundColor:
                  'rgba(230,201,152,0.45)',
              }}
            />

            <View
              style={{
                width: 10,
              }}
            />

            <View
              style={{
                height: 1,

                width: 42,

                backgroundColor:
                  'rgba(230,201,152,0.45)',
              }}
            />
          </View>

          <Text
            style={{
              color: '#D4D4D8',

              fontSize: 18,

              lineHeight: 30,

              textAlign: 'center',

              maxWidth: 340,
            }}
          >
            Kivételes ingatlanok.
            Kivételes életstílus.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(
            120
          ).springify()}
          style={{
            width: '100%',

            alignItems: 'center',

            gap: 18,
          }}
        >
          <Pressable
            onPress={() =>
              router.push('/login')
            }
            style={{
              backgroundColor:
                '#E6C998',

              paddingVertical: 22,

              borderRadius: 999,

              alignItems: 'center',

              width: '100%',

              maxWidth: 420,

              shadowColor: '#E6C998',

              shadowOffset: {
                width: 0,
                height: 8,
              },

              shadowOpacity: 0.22,

              shadowRadius: 24,

              elevation: 10,
            }}
          >
            <Text
              style={{
                color: '#000',

                fontSize: 20,

                fontWeight: '800',

                letterSpacing: 2,
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
              paddingVertical: 20,

              borderRadius: 999,

              alignItems: 'center',

              borderWidth: 1,

              borderColor:
                'rgba(230,201,152,0.45)',

              backgroundColor:
                'rgba(255,255,255,0.02)',

              width: '100%',

              maxWidth: 420,
            }}
          >
            <Text
              style={{
                color: '#E6C998',

                fontSize: 18,

                fontWeight: '700',

                letterSpacing: 1.2,
              }}
            >
              REGISZTRÁCIÓ
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.replace(
                '/(tabs)'
              )
            }
            style={{
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color:
                  'rgba(230,201,152,0.72)',

                fontSize: 16,

                letterSpacing: 0.6,
              }}
            >
              Vendégként böngészem →
            </Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  )
}