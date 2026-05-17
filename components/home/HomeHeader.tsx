import { Text } from 'react-native'

import Animated, {
    FadeInDown,
} from 'react-native-reanimated'

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
        gap: 12,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 52,
          fontWeight: '900',
          letterSpacing: -2,
        }}
      >
        REALVIA
      </Text>

      <Text
        style={{
          color: '#A1A1AA',
          fontSize: 18,
          lineHeight: 28,
          maxWidth: 300,
        }}
      >
        Találd meg álmaid luxus
        ingatlanát
      </Text>

      {!!email && (
        <Text
          style={{
            color: '#52525B',
            fontSize: 14,
          }}
        >
          {email}
        </Text>
      )}
    </Animated.View>
  )
}