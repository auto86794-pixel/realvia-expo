import React from 'react'

import {
    Text,
    View,
} from 'react-native'

interface Props {
  description?: string
}

export default function PropertyDescription({
  description,
}: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 34,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 30,
          fontWeight: '700',
          marginBottom: 18,
        }}
      >
        Ingatlan leírása
      </Text>

      <Text
        style={{
          color: '#A1A1AA',
          fontSize: 17,
          lineHeight: 32,
        }}
      >
        {description ||
          'Kivételes prémium ingatlan modern építészettel, privát hangulattal és luxus életérzéssel. A tágas terek, a természetes fény és az elegáns anyaghasználat egy olyan otthont teremtenek, amely egyszerre nyugodt, exkluzív és inspiráló.'}
      </Text>
    </View>
  )
}