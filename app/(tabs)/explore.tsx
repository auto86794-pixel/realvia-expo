import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Explore
        </Text>

        <Text style={styles.subtitle}>
          Luxury properties coming soon...
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060A',
  },

  content: {
    paddingTop: 100,
    paddingHorizontal: 24,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
  },

  subtitle: {
    color: '#8F939D',
    fontSize: 16,
    marginTop: 12,
  },
})