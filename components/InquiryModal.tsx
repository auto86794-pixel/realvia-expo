import React, {
  useState,
} from 'react'

import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'

import {
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react-native'

import { supabase } from '@/src/services/supabase'

const AGENT_PHONE =
  '+36301234567'

const AGENT_EMAIL =
  'info@realvia.hu'

interface Props {
  visible: boolean
  onClose: () => void
  propertyId: number
  propertyTitle: string
}

export default function InquiryModal({
  visible,
  onClose,
  propertyId,
  propertyTitle,
}: Props) {
  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [phone, setPhone] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  async function submitInquiry() {
    try {
      if (!name || !email) {
        Alert.alert(
          'Hiba',
          'A név és email kötelező.'
        )
        return
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailRegex.test(email)) {
        Alert.alert(
          'Hiba',
          'Adj meg érvényes email címet.'
        )
        return
      }

      setLoading(true)

      const cleanedPhone =
        phone.replace(/[^\d+]/g, '')

      const { error } =
        await supabase
          .from('inquiries')
          .insert({
            property_id: propertyId,
            property_title: propertyTitle,
            customer_name: name.trim(),
            customer_email: email.trim(),
            customer_phone:
              cleanedPhone,
            message: message.trim(),
          })

      if (error) {
        console.log(error)

        Alert.alert(
          'Hiba',
          error.message
        )

        return
      }
      console.log('INSERT SIKERES')

if (Platform.OS === 'web') {
  alert('Az érdeklődés elküldve.')
} else {
  Alert.alert(
    'Siker',
    'Az érdeklődés elküldve.'
  )
}

      
        

      setName('')
      setEmail('')
      setPhone('')
      setMessage('')

      onClose()
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Hiba',
        'Váratlan hiba történt.'
      )
    } finally {
      setLoading(false)
    }
  }

  function openPhone() {
    Linking.openURL(
      `tel:${AGENT_PHONE}`
    )
  }

  function openEmail() {
    Linking.openURL(
      `mailto:${AGENT_EMAIL}`
    )
  }

  async function openWhatsApp() {
    try {
      const text =
        `Szia! Érdeklődöm az ingatlan iránt: ${propertyTitle}`

      const url =
        `https://wa.me/${AGENT_PHONE.replace(
          '+',
          ''
        )}?text=${encodeURIComponent(
          text
        )}`

      const supported =
        await Linking.canOpenURL(url)

      if (!supported) {
        Alert.alert(
          'Hiba',
          'A WhatsApp nem található.'
        )
        return
      }

      await Linking.openURL(url)
    } catch (error) {
      Alert.alert(
        'Hiba',
        'Nem sikerült megnyitni a WhatsAppot.'
      )
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor:
            'rgba(0,0,0,0.7)',
        }}
      >
        <View
          style={{
            backgroundColor: '#111',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            paddingBottom: 40,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 28,
              fontWeight: '700',
              marginBottom: 8,
            }}
          >
            Kapcsolat
          </Text>

          <Text
            style={{
              color: '#888',
              marginBottom: 24,
            }}
          >
            {propertyTitle}
          </Text>

          <View
            style={{
              gap: 14,
              marginBottom: 24,
            }}
          >
            <Pressable
              onPress={openPhone}
              style={{
                backgroundColor:
                  'rgba(255,255,255,0.06)',
                borderRadius: 18,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <Phone
                size={22}
                color="#D6B07B"
              />

              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                Telefonhívás
              </Text>
            </Pressable>

            <Pressable
              onPress={openEmail}
              style={{
                backgroundColor:
                  'rgba(255,255,255,0.06)',
                borderRadius: 18,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <Mail
                size={22}
                color="#D6B07B"
              />

              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                Email küldése
              </Text>
            </Pressable>

            <Pressable
              onPress={openWhatsApp}
              style={{
                backgroundColor: '#D6B07B',
                borderRadius: 18,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
              }}
            >
              <MessageCircle
                size={22}
                color="#000"
              />

              <Text
                style={{
                  color: '#000',
                  fontSize: 16,
                  fontWeight: '800',
                }}
              >
                WhatsApp
              </Text>
            </Pressable>
          </View>

          <TextInput
            placeholder="Név"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            style={{
              backgroundColor: '#1A1A1A',
              color: 'white',
              borderRadius: 16,
              padding: 16,
              marginBottom: 14,
            }}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: '#1A1A1A',
              color: 'white',
              borderRadius: 16,
              padding: 16,
              marginBottom: 14,
            }}
          />

          <TextInput
            placeholder="Telefon"
            placeholderTextColor="#666"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{
              backgroundColor: '#1A1A1A',
              color: 'white',
              borderRadius: 16,
              padding: 16,
              marginBottom: 14,
            }}
          />

          <TextInput
            placeholder="Üzenet"
            placeholderTextColor="#666"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              backgroundColor: '#1A1A1A',
              color: 'white',
              borderRadius: 16,
              padding: 16,
              height: 120,
              marginBottom: 20,
            }}
          />

          <Pressable
            onPress={submitInquiry}
            disabled={loading}
            style={{
              backgroundColor: '#D6B07B',
              padding: 18,
              borderRadius: 18,
              alignItems: 'center',
              opacity: loading
                ? 0.6
                : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator
                color="#000"
              />
            ) : (
              <Text
                style={{
                  color: '#000',
                  fontWeight: '800',
                  fontSize: 16,
                }}
              >
                Érdeklődés küldése
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              if (!loading) {
                onClose()
              }
            }}
            style={{
              marginTop: 16,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#888',
              }}
            >
              Bezárás
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}