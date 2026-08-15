import {
  Platform,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'

import {
  Search,
} from 'lucide-react-native'

import {
  useState,
} from 'react'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import {
  Radius,
  Shadows,
} from '@/constants/theme'

type Props = {
  value: string
  onChange: (text: string) => void
}

export default function SearchBar({
  value,
  onChange,
}: Props) {
  const [focused, setFocused] =
    useState(false)

  const { width } =
    useWindowDimensions()

  const isMobile = width < 768

  return (
    <Animated.View
      entering={FadeInDown.delay(
        120
      ).springify()}
      style={{
        backgroundColor:
          focused
            ? 'rgba(255,255,255,0.96)'
            : 'rgba(255,255,255,0.88)',

        borderRadius:
          Radius.full,

        paddingHorizontal:
          isMobile ? 16 : 26,

        paddingVertical:
          isMobile
            ? 15
            : Platform.OS === 'web'
              ? 24
              : 20,

        borderWidth: 1,

        borderColor:
          focused
            ? '#CDBA9F'
            : 'rgba(255,255,255,0.72)',

        flexDirection: 'row',

        alignItems: 'center',

        gap:
          isMobile ? 11 : 16,

        ...(
          Platform.OS === 'web'
            ? ({
                backdropFilter:
                  'blur(20px)',
              } as any)
            : {}
        ),

        ...Shadows.luxury,
      }}
    >
      <View
        style={{
          width:
            isMobile ? 40 : 42,

          height:
            isMobile ? 40 : 42,

          borderRadius: 999,

          backgroundColor:
            '#F0E5D6',

          alignItems: 'center',

          justifyContent:
            'center',

          flexShrink: 0,
        }}
      >
        <Search
          size={20}
          color={
            focused
              ? '#8B6338'
              : '#68756D'
          }
        />
      </View>

      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() =>
          setFocused(true)
        }
        onBlur={() =>
          setFocused(false)
        }
        placeholder={
          isMobile
            ? 'Település vagy ingatlan neve...'
            : 'Keress település vagy ingatlan neve alapján...'
        }
        placeholderTextColor="#66716A"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          flex: 1,

          minWidth: 0,

          color: '#1D2923',

          fontSize:
            isMobile ? 16 : 18,

          lineHeight:
            isMobile ? 22 : 25,

          fontWeight: '600',

          paddingVertical: 2,

          paddingHorizontal: 0,
        }}
      />
    </Animated.View>
  )
}