import React from 'react'

import {
    Text,
    View,
} from 'react-native'

import {
    ShieldCheck,
    Sparkles,
} from 'lucide-react-native'

export default function PropertyAgent() {
  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 34,
      }}
    >
      <View
        style={{
          backgroundColor:
            'rgba(255,255,255,0.045)',
          borderWidth: 1,
          borderColor:
            'rgba(255,255,255,0.08)',
          borderRadius: 30,
          padding: 26,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
            backgroundColor:
              'rgba(214,176,123,0.14)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <Sparkles
            size={28}
            color="#D6B07B"
          />
        </View>

        <Text
          style={{
            color: 'white',
            fontSize: 28,
            fontWeight: '800',
            lineHeight: 36,
          }}
        >
          Prémium Ingatlan Concierge
        </Text>

        <Text
          style={{
            color: '#A1A1AA',
            fontSize: 16,
            lineHeight: 30,
            marginTop: 16,
          }}
        >
          Személyre szabott ingatlan
          tanácsadás, privát
          megtekintés szervezés és
          diszkrét concierge
          szolgáltatás prémium
          ügyfelek számára.
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 10,
            marginTop: 24,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor:
              'rgba(214,176,123,0.14)',
          }}
        >
          <ShieldCheck
            size={16}
            color="#D6B07B"
          />

          <Text
            style={{
              color: '#D6B07B',
              fontSize: 13,
              fontWeight: '800',
              letterSpacing: 1,
            }}
          >
            Concierge Service
          </Text>
        </View>
      </View>
    </View>
  )
}