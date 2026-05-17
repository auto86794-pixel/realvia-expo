import {
  Platform,
  TextInput,
  View,
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
  Colors,
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

  return (
    <Animated.View
      entering={FadeInDown.delay(
        120
      ).springify()}
      style={{
        backgroundColor:
          focused
            ? 'rgba(255,255,255,0.10)'
            : 'rgba(255,255,255,0.06)',

        borderRadius:
          Radius.full,

        paddingHorizontal: 26,

        paddingVertical:
          Platform.OS === 'web'
            ? 24
            : 20,

        borderWidth: 1,

        borderColor: focused
          ? 'rgba(214,176,123,0.35)'
          : 'rgba(255,255,255,0.08)',

        flexDirection: 'row',

        alignItems: 'center',

        gap: 16,

        backdropFilter:
          'blur(20px)',

        ...Shadows.luxury,
      }}
    >
      {/* ICON */}
      <View
        style={{
          width: 42,
          height: 42,

          borderRadius: 999,

          backgroundColor:
            'rgba(255,255,255,0.08)',

          alignItems: 'center',

          justifyContent:
            'center',
        }}
      >
        <Search
          size={20}
          color={
            focused
              ? Colors.dark.primary
              : '#9CA3AF'
          }
        />
      </View>

      {/* INPUT */}
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() =>
          setFocused(true)
        }
        onBlur={() =>
          setFocused(false)
        }
        placeholder="Search luxury properties..."
        placeholderTextColor="#71717A"
        style={{
          flex: 1,

          color: 'white',

          fontSize:
            Platform.OS === 'web'
              ? 18
              : 16,

          fontWeight: '500',

          paddingVertical: 2,
        }}
      />
    </Animated.View>
  )
}