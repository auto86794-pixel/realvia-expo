import React from 'react'
import { Text, View } from 'react-native'

export default function InquiriesScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#05060A',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 32,
          fontWeight: '700',
        }}
      >
        Érdeklődések
      </Text>

      <Text
        style={{
          color: '#999',
          marginTop: 12,
          fontSize: 16,
        }}
      >
        Itt jelennek majd meg az üzenetek.
      </Text>
    </View>
  )
}