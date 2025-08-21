// lib/mapbox.ts
import Mapbox from '@rnmapbox/maps';

// Opción 1: Usar directamente la variable de entorno
const MAPBOX_PUBLIC_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

// Opción 2: Usar Constants como fallback
// import Constants from 'expo-constants';
// const MAPBOX_PUBLIC_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 
//   Constants.expoConfig?.extra?.mapboxToken;

if (!MAPBOX_PUBLIC_TOKEN) {
  throw new Error('❌ EXPO_PUBLIC_MAPBOX_TOKEN no está definido en .env');
}

console.log('✅ Mapbox token cargado correctamente');

Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);
Mapbox.setTelemetryEnabled(false);

export default Mapbox;