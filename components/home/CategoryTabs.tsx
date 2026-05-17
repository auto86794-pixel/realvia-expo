import {
  Platform,
  Pressable,
  ScrollView,
  Text
} from 'react-native'

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
      entering={FadeInDown.delay(
        200
      ).springify()}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={{
          gap: 16,

          paddingRight: 24,

          paddingVertical: 6,
        }}
      >
        {categories.map((category) => {
          const active =
            selectedCategory ===
            category

          const isHovered =
            hovered === category

          return (
            <Pressable
              key={category}
              onPress={() =>
                onSelect(category)
              }
              onHoverIn={() => {
                if (
                  Platform.OS ===
                  'web'
                ) {
                  setHovered(
                    category
                  )
                }
              }}
              onHoverOut={() =>
                setHovered(null)
              }
              style={{
                paddingHorizontal: 28,

                paddingVertical: 16,

                borderRadius:
                  Radius.full,

                backgroundColor:
                  active
                    ? Colors.dark
                        .primary
                    : isHovered
                    ? 'rgba(255,255,255,0.10)'
                    : 'rgba(255,255,255,0.06)',

                borderWidth: 1,

                borderColor:
                  active
                    ? 'rgba(214,176,123,0.45)'
                    : 'rgba(255,255,255,0.08)',

                justifyContent:
                  'center',

                alignItems:
                  'center',

                minHeight: 58,

                ...Shadows.luxury,
              }}
            >
              <Text
                style={{
                  color: active
                    ? '#000'
                    : '#FFF',

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