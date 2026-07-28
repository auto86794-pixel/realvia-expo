import {
  Platform,
  Pressable,
  ScrollView,
  Text,
} from 'react-native'

import { useState } from 'react'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import {
  Colors,
  Radius,
  Shadows,
} from '@/constants/theme'

type Props = {
  categories: string[]
  selectedCategory: string
  onSelect: (category: string) => void
}

export default function CategoryTabs({
  categories,
  selectedCategory,
  onSelect,
}: Props) {
  const [hovered, setHovered] =
    useState<string | null>(null)

  return (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      style={{
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          width: '100%',
        }}
        contentContainerStyle={{
          gap: 16,
          paddingVertical: 6,
        }}
      >
        {categories.map((category) => {
          const active =
            selectedCategory === category

          const isHovered =
            hovered === category

          return (
            <Pressable
              key={category}
              onPress={() =>
                onSelect(category)
              }
              onHoverIn={() => {
                if (Platform.OS === 'web') {
                  setHovered(category)
                }
              }}
              onHoverOut={() =>
                setHovered(null)
              }
              style={{
                flexShrink: 0,
                minWidth: 120,
                paddingHorizontal: 28,
                paddingVertical: 16,
                borderRadius: Radius.full,
                backgroundColor: active
                  ? '#2E4639'
                  : isHovered
                  ? '#F0E9DE'
                  : '#FFFDFC',
                borderWidth: 1,
                borderColor: active
                  ? '#2E4639'
                  : '#DDD7CE',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 58,
                ...Shadows.luxury,
              }}
            >
              <Text
                style={{
                  color: active
                    ? '#FFF'
                    : '#455149',
                  fontWeight: '800',
                  fontSize: 15,
                  letterSpacing: 0.3,
                }}
              >
                {category}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </Animated.View>
  )
}
