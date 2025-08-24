// app/(tabs)/_layout.tsx - Sistema de navegación completo para SpotMyTrash
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/app/components/HapticTab';
import { IconSymbol } from '@/app/components/ui/IconSymbol';
import TabBarBackground from '@/app/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // Tu color principal #00ffcc sería perfecto aquí
        tabBarActiveTintColor: '#00ffcc',
        // Color para tabs inactivos
        tabBarInactiveTintColor: '#8e8e93',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderTopWidth: 0.5,
            borderTopColor: '#c6c6c8',
          },
          default: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0.5,
            borderTopColor: '#e5e5e7',
            elevation: 8,
          },
        }),
        // Estilo consistente para las etiquetas de tabs
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? -5 : 5,
        },
      }}>
      
      {/* 🗺️ Pantalla Principal - Mapa */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="map.fill" 
              color={color} 
            />
          ),
          // Badge opcional para mostrar nuevos puntos
          tabBarBadge: undefined, // Podrías agregar un contador aquí
        }}
      />

      {/* 📋 Pantalla de Reportes - Tu implementación está excelente */}
      <Tabs.Screen
        name="reportes"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="list.bullet.rectangle" 
              color={color} 
            />
          ),
        }}
      />

      {/* 👤 Pantalla de Perfil - Muy bien desarrollada */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="person.circle.fill" 
              color={color} 
            />
          ),
        }}
      />

      {/* ℹ️ Pantalla Info/Acerca de */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Info',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="info.circle.fill" 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}