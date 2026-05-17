import {
    TextInput
} from 'react-native'

import Animated, {
    FadeInDown,
} from 'react-native-reanimated'

type Props = {
  value: string
  onChange: (text: string) => void
}

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(
        120
      ).springify()}
      style={{
        backgroundColor:
          'rgba(255,255,255,0.04)',

        borderRadius: 28,

        paddingHorizontal: 22,
        paddingVertical: 20,

        borderWidth: 1,
        borderColor:
          'rgba(255,255,255,0.06)',
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Keresés luxus ingatlanok között..."
        placeholderTextColor="#71717A"
        style={{
          color: 'white',
          fontSize: 16,
        }}
      />
    </Animated.View>
  )
}