import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { Image } from 'expo-image'

import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'

import Animated, {
  FadeInDown,
} from 'react-native-reanimated'

import { supabase } from '@/src/services/supabase'
import { useProtectedRoute } from '../../src/hooks/useProtectedRoute'

import { useAuth } from '../../src/providers/AuthProvider'


const MAX_GALLERY_IMAGES = 12

export default function CreateScreen() {
  useProtectedRoute()

  const { session } = useAuth()

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')

  const [image, setImage] = useState('')
  const [galleryImages, setGalleryImages] =
    useState<string[]>([])

  const [loading, setLoading] =
    useState(false)

  const [uploadingCover, setUploadingCover] =
    useState(false)

  const [uploadingGallery, setUploadingGallery] =
    useState(false)

  const [previewVisible, setPreviewVisible] =
    useState(false)

  const [selectedPreviewImage, setSelectedPreviewImage] =
    useState('')
  

  
  async function uploadImage(uri: string) {
    const response = await fetch(uri)

    const blob = await response.blob()

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.jpg`

    const { error } = await supabase.storage
      .from('properties')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
      })

    if (error) {
      throw error
    }

    const { data } = supabase.storage
      .from('properties')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async function requestPermission() {
    if (Platform.OS === 'web') return true

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    return permission.granted
  }

  async function pickCoverImage() {
    try {
      const granted = await requestPermission()

      if (!granted) {
        Alert.alert(
          'Engedély szükséges',
          'Kérlek engedélyezd a galéria hozzáférést.'
        )

        return
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.7,
        })

      if (result.canceled) return

      setUploadingCover(true)

      const publicUrl = await uploadImage(
        result.assets[0].uri
      )

      setImage(publicUrl)
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'A borítókép feltöltése sikertelen.'
      )
    } finally {
      setUploadingCover(false)
    }
  }

  async function pickGalleryImages() {
    try {
      if (
        galleryImages.length >=
        MAX_GALLERY_IMAGES
      ) {
        Alert.alert(
          'Limit elérve',
          `Maximum ${MAX_GALLERY_IMAGES} kép tölthető fel.`
        )

        return
      }

      const granted = await requestPermission()

      if (!granted) {
        Alert.alert(
          'Engedély szükséges',
          'Kérlek engedélyezd a galéria hozzáférést.'
        )

        return
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          quality: 0.7,
        })

      if (result.canceled) return

      const remainingSlots =
        MAX_GALLERY_IMAGES -
        galleryImages.length

      const selectedAssets = result.assets.slice(
        0,
        remainingSlots
      )

      setUploadingGallery(true)

      const uploadedUrls = await Promise.all(
        selectedAssets.map(asset =>
          uploadImage(asset.uri)
        )
      )

      if (!image && uploadedUrls.length > 0) {
        setImage(uploadedUrls[0])
      }

      setGalleryImages(current => [
        ...current,
        ...uploadedUrls,
      ])
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'A galéria képek feltöltése sikertelen.'
      )
    } finally {
      setUploadingGallery(false)
    }
  }

  function openPreview(imageUrl: string) {
    setSelectedPreviewImage(imageUrl)
    setPreviewVisible(true)
  }

  function closePreview() {
    setPreviewVisible(false)
    setSelectedPreviewImage('')
  }

  function removeGalleryImage(index: number) {
    setGalleryImages(current =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    )
  }

  async function createProperty() {
 console.log('CREATE STARTED')
    if (!session?.user) {
    Alert.alert(
      'Hiba',
      'Ingatlan létrehozásához be kell jelentkezned.'
    )

    return
  }

  if (
    !title ||
    !price ||
    !location ||
    !category ||
    !image
  ) {

    
      Alert.alert(
        'Hiányzó adatok',
        'Minden kötelező mezőt tölts ki.'
      )

      return
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('properties')
        .insert({
  title: String(title).trim(),
  price: String(price).trim(),
  location: String(location).trim(),
  category: String(category).trim(),
  image,
  gallery: galleryImages,
})
       
      if (error) {
        console.log(error)

        Alert.alert(
          'Hiba',
          'Nem sikerült publikálni az ingatlant.'
        )

        return
      }

      Alert.alert(
        'Siker',
        'Az ingatlan publikálva lett.'
      )

      setTitle('')
      setPrice('')
      setLocation('')
      setCategory('')
      setImage('')
      setGalleryImages([])
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'Valami hiba történt.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: 110,
          paddingBottom: 260,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={{ marginBottom: 42 }}
        >
          <Text style={styles.eyebrow}>
            REALVIA STUDIO
          </Text>

          <Text style={styles.title}>
            Új Luxus Ingatlan
          </Text>

          <Text style={styles.subtitle}>
            Prémium ingatlanok publikálása
            exkluzív megjelenéssel.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).springify()}
          style={styles.form}
        >
          <View style={styles.section}>
            <Text style={styles.label}>
              Ingatlan neve
            </Text>

            <TextInput
              placeholder="Modern Tengerparti Villa"
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Ár</Text>

            <TextInput
              placeholder="139 Mft"
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Helyszín
            </Text>

            <TextInput
              placeholder="Debrecen"
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Kategória
            </Text>

            <TextInput
              placeholder="Luxus Villa"
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Borítókép
            </Text>

            <Pressable
              style={[
                styles.uploadButton,
                uploadingCover &&
                  styles.disabledButton,
              ]}
              disabled={uploadingCover}
              onPress={pickCoverImage}
            >
              <Text style={styles.uploadButtonText}>
                {uploadingCover
                  ? 'Feltöltés...'
                  : 'Borítókép feltöltése'}
              </Text>
            </Pressable>

            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.previewImage}
                contentFit="cover"
                transition={300}
              />
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Galéria képek
            </Text>

            <Pressable
              style={[
                styles.uploadButton,
                uploadingGallery &&
                  styles.disabledButton,
              ]}
              disabled={uploadingGallery}
              onPress={pickGalleryImages}
            >
              <Text style={styles.uploadButtonText}>
                {uploadingGallery
                  ? 'Galéria feltöltése...'
                  : `Galéria képek feltöltése (${galleryImages.length}/${MAX_GALLERY_IMAGES})`}
              </Text>
            </Pressable>

            {galleryImages.length > 0 ? (
              <View style={styles.galleryGrid}>
                {galleryImages.map((item, index) => (
                  <View
                    key={item}
                    style={styles.galleryItem}
                  >
                    <Pressable
                      onPress={() =>
                        openPreview(item)
                      }
                    >
                      <Image
                        source={{ uri: item }}
                        style={styles.galleryImage}
                        contentFit="cover"
                        transition={300}
                      />
                    </Pressable>

                    <Pressable
                      style={styles.removeButton}
                      onPress={() =>
                        removeGalleryImage(index)
                      }
                    >
                      <Text
                        style={styles.removeButtonText}
                      >
                        ✕
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.helperText}>
                Tölts fel több képet az ingatlan
                galériájához.
              </Text>
            )}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(240).springify()}
        >
          <Pressable
            style={[
              styles.button,
              loading && styles.disabledButton,
            ]}
            disabled={loading}
            onPress={createProperty}
          >
            <Text style={styles.buttonText}>
              {loading
                ? 'Publikálás...'
                : 'Ingatlan publikálása'}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
      >
        <View style={styles.previewModal}>
          <Pressable
            style={styles.previewBackdrop}
            onPress={closePreview}
          />

          <Image
            source={selectedPreviewImage} 
            style={styles.fullscreenImage}
            contentFit="contain"
            transition={300}
          />

          <Pressable
            style={styles.closePreviewButton}
            onPress={closePreview}
          >
            <Text style={styles.closePreviewText}>
              ✕
            </Text>
          </Pressable>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },

  eyebrow: {
    color: '#D6B98C',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 18,
  },

  title: {
    color: 'white',
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 52,
    marginBottom: 18,
  },

  subtitle: {
    color: '#A1A1AA',
    fontSize: 17,
    lineHeight: 28,
    maxWidth: 340,
  },

  form: {
    gap: 24,
  },

  section: {
    gap: 12,
  },

  label: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    color: 'white',
    fontSize: 17,
  },

  uploadButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    paddingVertical: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: 28,
    marginTop: 18,
  },

  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },

  galleryItem: {
    width: 110,
    height: 110,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111',
  },

  galleryImage: {
    width: 110,
    height: 110,
  },

  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },

  helperText: {
    color: '#71717A',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },

  button: {
    backgroundColor: '#D6B98C',
    borderRadius: 999,
    paddingVertical: 22,
    alignItems: 'center',
    marginTop: 42,
    shadowColor: '#D6B98C',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 14,
  },

  buttonText: {
    color: '#050505',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  disabledButton: {
    opacity: 0.6,
  },

  previewModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  previewBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  fullscreenImage: {
    width: '100%',
    height: '80%',
     maxWidth: 1200,
  },

  closePreviewButton: {
    position: 'absolute',
    top: 70,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closePreviewText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
})