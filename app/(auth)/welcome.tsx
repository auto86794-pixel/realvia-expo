import {
  ImageBackground,
  Pressable,
  Text
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
          'rgba(0,0,0,0.92)',
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
            marginBottom: 34,
          }}
        >
          <Text
            style={{
              color: 'white',

              fontSize: 58,

              fontWeight: '900',

              letterSpacing: -3,
            }}
          >
            REALVIA
          </Text>

          <Text
            style={{
              color: 'white',

              fontSize: 22,

              fontWeight: '700',

              marginTop: 10,
            }}
          >
            Találd meg álmaid otthonát
          </Text>

          <Text
            style={{
              color: '#D4D4D8',

              fontSize: 16,

              marginTop: 18,

              lineHeight: 25,
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
                '#D6B07B',

              paddingVertical: 20,

              borderRadius: 28,

              alignItems: 'center',

              width: '100%',

              maxWidth: 420,

              shadowColor: '#D6B07B',

              shadowOffset: {
                width: 0,
                height: 0,
              },

              shadowOpacity: 0.18,

              shadowRadius: 16,

              elevation: 8,
            }}
          >
            <Text
              style={{
                color: '#000000',

                fontSize: 18,

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

              borderRadius: 26,

              alignItems: 'center',

              borderWidth: 1,

              borderColor:
                'rgba(255,255,255,0.08)',

              backgroundColor:
                'rgba(255,255,255,0.03)',

              width: '100%',

              maxWidth: 420,
            }}
          >
            <Text
              style={{
                color: 'white',

                fontSize: 17,

                fontWeight: '700',

                letterSpacing: 0.5,
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
              marginTop: 6,
            }}
          >
            <Text
              style={{
                color:
                  'rgba(255,255,255,0.55)',

                fontSize: 15,

                letterSpacing: 0.3,
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