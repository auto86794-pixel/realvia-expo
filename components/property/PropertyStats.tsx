import React from 'react'

import {
    Text,
    View,
} from 'react-native'

import {
    Bath,
    BedDouble,
    Car,
    Maximize,
} from 'lucide-react-native'

interface Props {
  bedrooms?: number | string
  bathrooms?: number | string
  size?: number | string
  parking?: number | string
}

export default function PropertyStats({
  bedrooms,
  bathrooms,
  size,
  parking,
}: Props) {
  const stats = [
    {
      label: 'Hálószoba',
      value: bedrooms || '4',
      icon: BedDouble,
    },
    {
      label: 'Fürdő',
      value: bathrooms || '3',
      icon: Bath,
    },
    {
      label: 'Méret',
      value: size
        ? `${size}m²`
        : '320m²',
      icon: Maximize,
    },
    {
      label: 'Parkoló',
      value: parking || '2',
      icon: Car,
    },
  ]

  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 30,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          backgroundColor:
            'rgba(255,255,255,0.045)',
          borderColor:
            'rgba(255,255,255,0.08)',
          borderWidth: 1,
          borderRadius: 30,
          paddingVertical: 20,
          paddingHorizontal: 8,
        }}
      >
        {stats.map((item) => {
          const Icon = item.icon

          return (
            <View
              key={item.label}
              style={{
                alignItems: 'center',
                flex: 1,
              }}
            >
              <Icon
                size={22}
                color="#D6B07B"
              />

              <Text
                style={{
                  color: 'white',
                  fontSize: 21,
                  fontWeight: '800',
                  marginTop: 10,
                }}
              >
                {item.value}
              </Text>

              <Text
                style={{
                  color: '#8F8F95',
                  marginTop: 5,
                  fontSize: 12,
                }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}