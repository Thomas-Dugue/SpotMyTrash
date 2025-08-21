// app/(tabs)/index.tsx
import Mapbox from '@/lib/mapbox';
import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';

export default function MapScreen() {
  // Log temporal para debugging
  console.log('🔍 Token desde env:', process.env.EXPO_PUBLIC_MAPBOX_TOKEN ? '✅ Existe' : '❌ No existe');
  
  useEffect(() => {
    const askLocation = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      }
    };
    askLocation();
  }, []); // <-- Necesitas cerrar el useEffect correctamente

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={StyleSheet.absoluteFill}
        styleURL={Mapbox.StyleURL.Street}
      >
        <Mapbox.Camera
          centerCoordinate={[-70.6483, -33.4569]}
          zoomLevel={12}
        />
        <Mapbox.UserLocation visible />
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});