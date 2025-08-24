import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import SystemUIController from './components/SystemUIController';

// Componente para el header global permanente
function GlobalHeader() {
  return (
    <View style={styles.globalHeader}>
      <Text style={styles.globalHeaderText}>Spot my Trash</Text>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* 🆕 Controlador para ocultar controles del sistema */}
      <SystemUIController />
      
      {/* Header global permanente que aparece en todas las pantallas */}
      <GlobalHeader />
      
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        
        <Stack.Screen
          name="Camera"
          options={{
            headerShown: false,
            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
          }}
        />
        
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            headerShown: false,
          }} 
        />
      </Stack>
      
      <StatusBar 
        style="dark" 
        backgroundColor="#00ffcc" 
        translucent={false}
        hidden={false}
      />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  globalHeader: {
    backgroundColor: '#00ffcc',
    paddingTop: Platform.OS === 'ios' ? 44 : 25,
    paddingBottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 1000,
  },
  globalHeaderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});