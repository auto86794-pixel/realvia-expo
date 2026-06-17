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

const isMobile =
  Platform.OS !== 'web'

export default function Welcome() {
  return (
    <ImageBackground
  source={require('../../assets/images/realvia-welcome.png')}
  resizeMode="cover"
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }}
>
      
    
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.25)',
          'rgba(0,0,0,0.94)',
        ]}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: 28,
          paddingBottom: isMobile
            ? 24
            : 54,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            marginBottom: isMobile
              ? 24
              : 42,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: isMobile
                ? 48
                : 54,
              height: isMobile
                ? 48
                : 54,
              borderWidth: 1,
              borderColor:
                'rgba(230,201,152,0.85)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                color: '#F2E6CF',
                fontSize: isMobile
                  ? 28
                  : 34,
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
              fontSize: isMobile
                ? 48
                : 64,
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
              marginBottom: 6,
            }}
          >
            REALVIA
          </Text>

          <Text
            style={{
              color: '#E8D3AE',
              fontSize: isMobile
                ? 16
                : 18,
              fontWeight: '600',
              letterSpacing: 1.2,
              textAlign: 'center',
              marginTop: 6,
            }}
          >
            EGY LÉPÉSSEL KÖZELEBB
            {'\n'}
            AZ OTTHONODHOZ
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 14,
              marginBottom: 14,
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
              fontSize: isMobile
                ? 16
                : 18,
              lineHeight: isMobile
                ? 24
                : 30,
              textAlign: 'center',
              maxWidth: 340,
            }}
          >
            Kivételes ingatlanok.
            {'\n'}
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
            gap: 14,
          }}
        >
          <Pressable
            onPress={() =>
              router.push('/login')
            }
            style={{
              backgroundColor:
                '#E6C998',
              paddingVertical: isMobile
                ? 18
                : 22,
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
                fontSize: isMobile
                  ? 18
                  : 20,
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
              paddingVertical: isMobile
                ? 16
                : 20,
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
                fontSize: isMobile
                  ? 16
                  : 18,
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
              marginTop: 4,
            }}
          >
            <Text
              style={{
                color:
                  'rgba(230,201,152,0.72)',
                fontSize: 15,
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