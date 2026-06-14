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
          justifyContent: 'space-between',
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
                  ? 64
                  : 48,
              fontWeight: '900',
              letterSpacing: -4,
              lineHeight:
                Platform.OS === 'web'
                  ? 64
                  : 52,
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
            PRÉMIUM INGATLANOK
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
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor:
              'rgba(212,175,55,0.12)',
            borderRadius:
              Radius.full,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 24,
            borderWidth: 1,
            borderColor:
              'rgba(212,175,55,0.25)',
          }}
        >
          <Text
            style={{
              color: '#D4AF37',
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 2,
            }}
          >
            ✦ PRÉMIUM INGATLANOK
          </Text>
        </View>

        <Text
          style={{
            color: 'white',
            fontSize:
              Platform.OS === 'web'
                ? 72
                : 48,
            lineHeight:
              Platform.OS === 'web'
                ? 78
                : 54,
            fontWeight: '900',
            letterSpacing: -3,
          }}
        >
          Prémium ingatlanok
          {'\n'}
          kivételes életstílushoz
        </Text>

        <Text
          style={{
            color: '#E5E7EB',
            fontSize:
              Platform.OS === 'web'
                ? 20
                : 17,
            lineHeight:
              Platform.OS === 'web'
                ? 32
                : 24,
            marginTop: 24,
            maxWidth: 560,
          }}
        >
          Válogatott luxusotthonok,
          villák és penthouse-ok
          egyetlen platformon.
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 36,
            gap: 40,
          }}
        >
          <View>
            <Text
              style={{
                color: 'white',
                fontSize: 28,
                fontWeight: '900',
              }}
            >
              500+
            </Text>

            <Text
              style={{
                color: '#9CA3AF',
                marginTop: 4,
              }}
            >
              Ingatlan
            </Text>
          </View>

          <View>
            <Text
              style={{
                color: 'white',
                fontSize: 28,
                fontWeight: '900',
              }}
            >
              1500+
            </Text>

            <Text
              style={{
                color: '#9CA3AF',
                marginTop: 4,
              }}
            >
              Ügyfél
            </Text>
          </View>

          <View>
            <Text
              style={{
                color: 'white',
                fontSize: 28,
                fontWeight: '900',
              }}
            >
              4.9★
            </Text>

            <Text
              style={{
                color: '#9CA3AF',
                marginTop: 4,
              }}
            >
              Értékelés
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  )
}