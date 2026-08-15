import { useAuth } from '@/src/providers/AuthProvider'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

export default function Welcome() {
  const { width, height } =
    useWindowDimensions()

  const { signOut } = useAuth()

  const mobile =
    width < 768 ||
    height > width * 1.25

  const [
    guestLoading,
    setGuestLoading,
  ] = useState(false)

  const [
    guestError,
    setGuestError,
  ] = useState('')

  async function browseAsGuest() {
    try {
      setGuestLoading(true)
      setGuestError('')

      await signOut()

      router.replace('/(tabs)')
    } catch (error) {
      console.error(
        'Guest sign-out failed:',
        error
      )

      setGuestError(
        'A böngészés indítása nem sikerült. Próbáld újra, vagy nyisd meg az oldalt privát ablakban.'
      )
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <View
      style={[
        styles.background,
        {
          minHeight: height,
        },
      ]}
    >
      {/* DESKTOP HÁTTÉR */}

      <Image
        source={require('../../assets/images/realvia-welcome-family-light.png')}
        contentFit="cover"
        transition={0}
        style={[
          styles.backgroundImage,
          mobile &&
            styles.hiddenImage,
        ]}
      />

      {/* MOBIL HÁTTÉR */}

      <Image
        source={require('../../assets/images/realvia-welcome-family-mobile.png')}
        contentFit="cover"
        transition={0}
        style={[
          styles.backgroundImage,
          !mobile &&
            styles.hiddenImage,
        ]}
      />

      <LinearGradient
        colors={
          mobile
            ? [
                'rgba(255,252,245,0)',
                'rgba(249,241,226,0.04)',
                'rgba(239,225,202,0.76)',
              ]
            : [
                'rgba(255,252,245,0.02)',
                'rgba(255,248,236,0.10)',
                'rgba(239,225,202,0.50)',
              ]
        }
        locations={[
          0,
          mobile ? 0.55 : 0.48,
          1,
        ]}
        style={[
          styles.overlay,
          mobile &&
            styles.overlayMobile,
          {
            minHeight: height,
          },
        ]}
      >
        <Animated.View
          entering={
            FadeInDown.springify()
          }
          style={[
            styles.panel,
            mobile &&
              styles.panelMobile,
          ]}
        >
          {/* REALVIA JEL */}

          <View
            style={[
              styles.mark,
              mobile &&
                styles.markMobile,
            ]}
          >
            <Text
              style={[
                styles.markText,
                mobile &&
                  styles.markTextMobile,
              ]}
            >
              R
            </Text>
          </View>

          {/* MÁRKANÉV */}

          <Text
            style={[
              styles.brand,
              mobile &&
                styles.brandMobile,
            ]}
          >
            REALVIA
          </Text>

          {/* SZLOGEN */}

          <Text
            style={[
              styles.kicker,
              mobile &&
                styles.kickerMobile,
            ]}
          >
            EGY LÉPÉSSEL KÖZELEBB AZ
            OTTHONODHOZ
          </Text>

          <View
            style={[
              styles.rule,
              mobile &&
                styles.ruleMobile,
            ]}
          />

          {/* FŐ ÜZENET */}

          <Text
            style={[
              styles.description,
              mobile &&
                styles.descriptionMobile,
            ]}
          >
            Fedezd fel azt a helyet,
            ahol a következő történeted
            kezdődhet.
          </Text>

          {/* MŰVELETEK */}

          <View
            style={[
              styles.actions,
              mobile &&
                styles.actionsMobile,
            ]}
          >
            {/* INGATLANOK BÖNGÉSZÉSE */}

            <Pressable
              onPress={
                browseAsGuest
              }
              disabled={
                guestLoading
              }
              style={({
                pressed,
              }) => [
                styles.primary,
                mobile &&
                  styles.buttonMobile,
                pressed &&
                  !guestLoading &&
                  styles.primaryPressed,
                guestLoading &&
                  styles.buttonDisabled,
              ]}
            >
              {guestLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.primaryText
                  }
                >
                  INGATLANOK BÖNGÉSZÉSE
                </Text>
              )}
            </Pressable>

            {/* INGATLANT HIRDETEK */}

            <Pressable
              onPress={() =>
                router.push(
                  '/register'
                )
              }
              style={({
                pressed,
              }) => [
                styles.secondary,
                mobile &&
                  styles.secondaryMobile,
                mobile &&
                  styles.buttonMobile,
                pressed &&
                  styles.secondaryPressed,
              ]}
            >
              <Text
                style={
                  styles.secondaryText
                }
              >
                INGATLANT HIRDETEK
              </Text>
            </Pressable>

            {/* BELÉPÉS */}

            <View
              style={
                styles.loginRow
              }
            >
              <Text
                style={
                  styles.loginHint
                }
              >
                Már van fiókod?
              </Text>

              <Pressable
                onPress={() =>
                  router.push(
                    '/login'
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.loginButton,
                  pressed &&
                    styles.loginButtonPressed,
                ]}
              >
                <Text
                  style={
                    styles.loginText
                  }
                >
                  Belépés →
                </Text>
              </Pressable>
            </View>

            {!!guestError && (
              <Text
                style={
                  styles.guestError
                }
              >
                {guestError}
              </Text>
            )}
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  )
}

const styles =
  StyleSheet.create({
    background: {
      flex: 1,
      width: '100%',
      backgroundColor:
        '#E9E1D4',
    },

    backgroundImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },

    hiddenImage: {
      opacity: 0,
    },

    overlay: {
      flex: 1,
      width: '100%',
      justifyContent:
        'center',
      alignItems:
        'flex-start',
      paddingHorizontal:
        Platform.OS === 'web'
          ? '7%'
          : 20,
      paddingVertical:
        Platform.OS === 'web'
          ? 42
          : 28,
    },

    overlayMobile: {
      justifyContent:
        'flex-end',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 22,
    },

    panel: {
      width: '100%',
      maxWidth: 470,
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 20,
    },

    panelMobile: {
      maxWidth: 440,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    mark: {
      width: 48,
      height: 48,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.72)',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    markMobile: {
      width: 40,
      height: 40,
    },

    markText: {
      color: '#FFFFFF',
      fontSize: 29,
      fontFamily:
        Platform.OS ===
        'web'
          ? 'Georgia, serif'
          : 'serif',
      textShadowColor:
        'rgba(0,0,0,0.55)',
      textShadowOffset: {
        width: 0,
        height: 2,
      },
      textShadowRadius: 4,
    },

    markTextMobile: {
      fontSize: 24,
    },

    brand: {
      color: '#FFFFFF',
      fontSize: 56,
      fontWeight: '400',
      letterSpacing: 5,
      marginTop: 13,
      fontFamily:
        Platform.OS ===
        'web'
          ? 'Georgia, serif'
          : 'serif',
      textShadowColor:
        'rgba(0,0,0,0.68)',
      textShadowOffset: {
        width: 0,
        height: 3,
      },
      textShadowRadius: 7,
    },

    brandMobile: {
      fontSize: 46,
      lineHeight: 55,
      marginTop: 9,
      letterSpacing: 4,
    },

    kicker: {
      color: '#FFFFFF',
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '900',
      letterSpacing: 1.8,
      textAlign: 'center',
      marginTop: 8,
      textShadowColor:
        'rgba(0,0,0,0.72)',
      textShadowOffset: {
        width: 0,
        height: 2,
      },
      textShadowRadius: 5,
    },

    kickerMobile: {
      fontSize: 17,
      lineHeight: 25,
      letterSpacing: 1.3,
      marginTop: 6,
      maxWidth: 360,
    },

    rule: {
      width: 48,
      height: 1,
      backgroundColor:
        'rgba(255,255,255,0.75)',
      marginVertical: 14,
      shadowColor:
        '#000000',
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },

    ruleMobile: {
      marginVertical: 10,
    },

    description: {
      color: '#173D2F',
      fontSize: 18,
      lineHeight: 27,
      fontWeight: '800',
      textAlign: 'center',
      maxWidth: 410,
      textShadowColor:
        'rgba(255,255,255,0.40)',
      textShadowOffset: {
        width: 0,
        height: 1,
      },
      textShadowRadius: 2,
    },

    descriptionMobile: {
      color: '#173D2F',
      fontSize: 18,
      lineHeight: 27,
      fontWeight: '800',
      maxWidth: 360,
    },

    actions: {
      width: '100%',
      gap: 10,
      marginTop: 20,
    },

    actionsMobile: {
      gap: 9,
      marginTop: 17,
    },

    primary: {
      minHeight: 56,
      borderRadius: 14,
      backgroundColor:
        '#2E4639',
      alignItems: 'center',
      justifyContent:
        'center',

      ...Platform.select({
        web: {
          cursor: 'pointer',
          boxShadow:
            '0 10px 28px rgba(31,55,43,0.20)',
        } as any,

        default: {},
      }),
    },

    primaryPressed: {
      opacity: 0.9,
      transform: [
        {
          scale: 0.995,
        },
      ],
    },

    buttonDisabled: {
      opacity: 0.72,
    },

    buttonMobile: {
      minHeight: 54,
      borderRadius: 13,
    },

    primaryText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 1.2,
      textAlign: 'center',
    },

    secondary: {
      minHeight: 54,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        '#BCA98E',
      backgroundColor:
        'rgba(255,255,255,0.48)',
      alignItems: 'center',
      justifyContent:
        'center',

      ...Platform.select({
        web: {
          cursor: 'pointer',
        } as any,

        default: {},
      }),
    },

    secondaryMobile: {
      backgroundColor:
        'rgba(255,255,255,0.18)',
      borderColor:
        '#A98257',
    },

    secondaryPressed: {
      opacity: 0.82,
    },

    secondaryText: {
      color: '#29483A',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 1.1,
      textAlign: 'center',
    },

    loginRow: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 5,
      marginTop: 4,
    },

    loginHint: {
      color: '#53655B',
      fontSize: 15,
      fontWeight: '600',
    },

    loginButton: {
      paddingHorizontal: 4,
      paddingVertical: 7,

      ...Platform.select({
        web: {
          cursor: 'pointer',
        } as any,

        default: {},
      }),
    },

    loginButtonPressed: {
      opacity: 0.65,
    },

    loginText: {
      color: '#29483A',
      fontSize: 15,
      fontWeight: '800',
    },

    guestError: {
      color: '#A64D49',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      textAlign: 'center',
    },
  })