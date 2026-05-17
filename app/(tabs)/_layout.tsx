import React from 'react'

import { Tabs } from 'expo-router'

import {
  Heart,
  Home,
  LayoutDashboard,
} from 'lucide-react-native'

import {
  StatusBar,
} from 'react-native'

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler'

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context'

export default function TabsLayout() {
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor: '#05060A',
      }}
    >
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
        />

        <Tabs
          screenOptions={{
            headerShown: false,

            tabBarStyle: {
              backgroundColor:
                '#0B0B0F',

              borderTopColor:
                'rgba(255,255,255,0.06)',

              height: 88,

              paddingBottom: 18,

              paddingTop: 12,
            },

            tabBarActiveTintColor:
              '#D6B07B',

            tabBarInactiveTintColor:
              '#71717A',
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Főoldal',

              tabBarIcon: ({
                color,
                size,
              }) => (
                <Home
                  color={color}
                  size={size}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="favorites"
            options={{
              title: 'Kedvencek',

              tabBarIcon: ({
                color,
                size,
              }) => (
                <Heart
                  color={color}
                  size={size}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="dashboard"
            options={{
              title: 'Dashboard',

              tabBarIcon: ({
                color,
                size,
              }) => (
                <LayoutDashboard
                  color={color}
                  size={size}
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