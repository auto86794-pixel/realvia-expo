import {
  Platform,
  Text,
  View,
} from 'react-native'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import {
  Colors,
  Radius,
} from '@/constants/theme'

type Props = {
  email?: string
}

export default function HomeHeader({
  email,
}: Props) {
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      style={{
        width: '100%',
      }}
    >
      {/* TOP NAVBAR */}
      <View
        style={{
          flexDirection: 'row',

          justifyContent:
            'space-between',

          alignItems: 'center',

          marginBottom:
            Platform.OS === 'web'
              ? 48
              : 32,
        }}
      >
        {/* BRAND */}
        <View>
          <Text
            style={{
              color: 'white',

              fontSize:
                Platform.OS === 'web'
                  ? 72
                  : 52,

              fontWeight: '900',

              letterSpacing: -4,

              lineHeight:
                Platform.OS === 'web'
                  ? 72
                  : 56,
            }}
          >
            REALVIA
          </Text>

          <Text
            style={{
              color:
                Colors.dark.primary,

              fontSize: 14,

              letterSpacing: 3,

              marginTop: 4,

              textTransform:
                'uppercase',

              fontWeight: '700',
            }}
          >
            Luxury Real Estate
          </Text>
        </View>

        {/* PROFILE CHIP */}
        {!!email && (
          <View
            style={{
              backgroundColor:
                'rgba(255,255,255,0.06)',

              borderRadius:
                Radius.full,

              paddingHorizontal: 20,

              paddingVertical: 14,

              borderWidth: 1,

              borderColor:
                'rgba(255,255,255,0.08)',

              maxWidth: 280,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: '#D1D5DB',

                fontSize: 14,

                fontWeight: '600',
              }}
            >
              {email}
            </Text>
          </View>
        )}
      </View>

      {/* HERO TEXT */}
      <View
        style={{
          maxWidth: 760,
        }}
      >
        <Text
          style={{
            color: 'white',

            fontSize:
              Platform.OS === 'web'
                ? 82
                : 48,

            lineHeight:
              Platform.OS === 'web'
                ? 88
                : 54,

            fontWeight: '900',

            letterSpacing: -4,
          }}
        >
          Find Your Dream Luxury Property
        </Text>

        <Text
          style={{
            color: '#A1A1AA',

            fontSize:
              Platform.OS === 'web'
                ? 22
                : 18,

            lineHeight:
              Platform.OS === 'web'
                ? 36
                : 30,

            marginTop: 28,

            maxWidth: 620,
          }}
        >
          Exclusive villas,
          penthouses and premium
          estates tailored for
          modern luxury living.
        </Text>
      </View>
    </Animated.View>
  )
}