import React from 'react'

import { Tabs } from 'expo-router'

import {
  Heart,
  Home,
  LayoutDashboard,
  Plus,
} from 'lucide-react-native'

import {
  Platform,
  StatusBar,
} from 'react-native'

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler'

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import { BlurView } from 'expo-blur'

import {
  Colors,
  Shadows,
} from '@/constants/theme'

function TabsContent() {
  const insets =
    useSafeAreaInsets()

  const isWeb =
    Platform.OS === 'web'

  return (
    <>
      <StatusBar
        barStyle="light-content"
      />

      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarActiveTintColor:
            Colors.dark.primary,

          tabBarInactiveTintColor:
            Colors.dark
              .tabIconDefault,

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },

          tabBarItemStyle: {
            flex: 1,
            alignItems: 'center',
            justifyContent:
              'center',
          },

          tabBarStyle: isWeb
            ? {
                display: 'none',
              }
            : {
                position:
                  'absolute',

                left: 12,
                right: 12,

                bottom:
                  insets.bottom + 10,

                height: 72,

                borderRadius: 28,

                backgroundColor:
                  'rgba(12,12,16,0.78)',

                borderTopWidth: 0,

                paddingTop: 8,
                paddingBottom: 8,

                overflow:
                  'hidden',

                ...(Platform.OS ===
                'android'
                  ? {
                      elevation: 0,
                    }
                  : {}),

                ...Shadows.luxury,
              },

          tabBarBackground:
            () => (
              <BlurView
                intensity={55}
                tint="dark"
                style={{
                  flex: 1,
                  borderRadius: 28,
                }}
              />
            ),
        }}
      >
        {/* HOME */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Főoldal',

            tabBarIcon: ({
              color,
              focused,
            }) => (
              <Home
                color={color}
                size={
                  focused
                    ? 25
                    : 22
                }
              />
            ),
          }}
        />

        {/* FAVORITES */}
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Mentett',

            tabBarIcon: ({
              color,
              focused,
            }) => (
              <Heart
                color={color}
                size={
                  focused
                    ? 25
                    : 22
                }
              />
            ),
          }}
        />

        {/* UPLOAD */}
        <Tabs.Screen
          name="upload"
          options={{
            title: 'Új',

            tabBarIcon: ({
              focused,
            }) => (
              <BlurView
                intensity={80}
                tint="light"
                style={{
                  width: 48,
                  height: 48,

                  borderRadius: 999,

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  backgroundColor:
                    Colors.dark.primary,
                }}
              >
                <Plus
                  color="#000"
                  size={
                    focused
                      ? 24
                      : 22
                  }
                  strokeWidth={
                    2.5
                  }
                />
              </BlurView>
            ),
          }}
        />

        {/* DASHBOARD */}
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Profil',

            tabBarIcon: ({
              color,
              focused,
            }) => (
              <LayoutDashboard
                color={color}
                size={
                  focused
                    ? 25
                    : 22
                }
              />
            ),
          }}
        />

        {/* HIDDEN ROUTES */}

        <Tabs.Screen
          name="create"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  )
}

export default function TabsLayout() {
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor:
          Colors.dark.background,
      }}
    >
      <SafeAreaProvider>
        <TabsContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}