import React from 'react'

import { Tabs } from 'expo-router'

import {
  Heart,
  Home,
  LayoutDashboard,
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
} from 'react-native-safe-area-context'

import {
  BlurView,
} from 'expo-blur'

import {
  Colors,
  Radius,
  Shadows,
} from '@/constants/theme'

export default function TabsLayout() {
  const isWeb =
    Platform.OS === 'web'

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor:
          Colors.dark.background,
      }}
    >
      <SafeAreaProvider>
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
              fontSize: 12,

              fontWeight: '700',

              marginTop: 4,
            },

            tabBarStyle: isWeb
              ? {
                  display: 'none',
                }
              : {
                  position:
                    'absolute',

                  left: 18,

                  right: 18,

                  bottom: 22,

                  height: 82,

                  borderRadius:
                    Radius.xl,

                  backgroundColor:
                    'rgba(12,12,16,0.82)',

                  borderTopWidth: 0,

                  paddingTop: 10,

                  paddingBottom: 12,

                  ...(Platform.OS ===
                  'android'
                    ? {
                        elevation: 0,
                      }
                    : {}),

                  ...Shadows.luxury,
                },

            tabBarBackground: () => (
              <BlurView
                intensity={80}
                tint="dark"
                style={{
                  flex: 1,

                  borderRadius:
                    Radius.xl,

                  overflow:
                    'hidden',
                }}
              />
            ),
          }}
        >
          {/* HOME */}
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',

              tabBarIcon: ({
                color,
                focused,
              }) => (
                <Home
                  color={color}
                  size={
                    focused
                      ? 26
                      : 23
                  }
                />
              ),
            }}
          />

          {/* FAVORITES */}
          <Tabs.Screen
            name="favorites"
            options={{
              title:
                'Favorites',

              tabBarIcon: ({
                color,
                focused,
              }) => (
                <Heart
                  color={color}
                  size={
                    focused
                      ? 26
                      : 23
                  }
                />
              ),
            }}
          />

          {/* DASHBOARD */}
          <Tabs.Screen
            name="dashboard"
            options={{
              title:
                'Dashboard',

              tabBarIcon: ({
                color,
                focused,
              }) => (
                <LayoutDashboard
                  color={color}
                  size={
                    focused
                      ? 26
                      : 23
                  }
                />
              ),
            }}
          />

          {/* HIDDEN ROUTES */}

          <Tabs.Screen
            name="upload"
            options={{
              href: null,
            }}
          />

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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}