import {
    Pressable,
    ScrollView,
    Text,
} from 'react-native'

import Animated, {
    FadeInDown,
} from 'react-native-reanimated'

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
          gap: 12,
          paddingRight: 24,
        }}
      >
        {categories.map((category) => {
          const active =
            selectedCategory ===
            category

          return (
            <Pressable
              key={category}
              onPress={() =>
                onSelect(category)
              }
              style={{
                paddingHorizontal: 24,
                paddingVertical: 15,

                borderRadius: 24,

                backgroundColor:
                  active
                    ? '#D6B98C'
                    : 'rgba(255,255,255,0.05)',
              }}
            >
              <Text
                style={{
                  color: active
                    ? 'black'
                    : 'white',

                  fontWeight: '700',

                  fontSize: 15,
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