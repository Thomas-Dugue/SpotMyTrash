// components/GarbageMap.tsx
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../../lib/firebase';

// Definimos la estructura de datos que esperamos de Firebase
interface GarbagePoint {
  id: string;
  gps: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  photoId: string;
  createdAt: any; // Firebase timestamp
}

// Definimos la estructura de la ubicación del usuario
interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function GarbageMap() {
  // Estados para manejar los datos y el estado de carga
  const [garbagePoints, setGarbagePoints] = useState<GarbagePoint[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener la ubicación actual del usuario
  const getUserLocation = async (): Promise<UserLocation | null> => {
    try {
      // Solicitamos permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Se necesitan permisos de ubicación para mostrar el mapa');
        return null;
      }

      // Obtenemos la posición actual con alta precisión
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (err) {
      console.error('Error obteniendo ubicación:', err);
      setError('No se pudo obtener la ubicación');
      return null;
    }
  };

  // Función para cargar los puntos de basura desde Firebase
  const loadGarbagePoints = async (): Promise<GarbagePoint[]> => {
    try {
      // Obtenemos todos los documentos de la colección garbagePoints
      const querySnapshot = await getDocs(collection(db, 'garbagePoints'));
      
      // Convertimos los documentos de Firebase a nuestro formato de datos
      const points: GarbagePoint[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Validamos que los datos tengan la estructura esperada
        if (data.gps && data.gps.latitude && data.gps.longitude) {
          points.push({
            id: doc.id,
            gps: data.gps,
            photoId: data.photoId,
            createdAt: data.createdAt,
          });
        }
      });

      return points;
    } catch (err) {
      console.error('Error cargando puntos de basura:', err);
      throw new Error('No se pudieron cargar los puntos de basura');
    }
  };

  // Efecto que se ejecuta cuando el componente se monta
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargamos tanto la ubicación del usuario como los puntos de basura en paralelo
        const [location, points] = await Promise.all([
          getUserLocation(),
          loadGarbagePoints(),
        ]);

        setUserLocation(location);
        setGarbagePoints(points);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeMap();
  }, []); // El array vacío significa que esto solo se ejecuta una vez

  // Función para generar el HTML del mapa con OpenStreetMap/Leaflet
  const generateMapHTML = () => {
    // Configuramos el centro del mapa: si tenemos ubicación del usuario, la usamos; sino, usamos Santiago
    const centerLat = userLocation?.latitude || -33.4489;
    const centerLng = userLocation?.longitude || -70.6693;

    // Generamos los marcadores de basura en formato JavaScript
    const garbageMarkersJS = garbagePoints.map(point => 
      `L.marker([${point.gps.latitude}, ${point.gps.longitude}])
        .addTo(map)
        .bindPopup("Basura reportada<br>ID: ${point.id}")
        .openPopup();`
    ).join('\n');

    // Generamos el marcador del usuario si tenemos su ubicación
    const userMarkerJS = userLocation ? 
      `L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMwMDc4ZmYiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map).bindPopup("Tu ubicación actual");` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mapa de Basura</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Inicializamos el mapa centrado en la ubicación apropiada
          const map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
          
          // Añadimos las capas de mapa de OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          // Añadimos el marcador del usuario
          ${userMarkerJS}
          
          // Añadimos todos los marcadores de basura
          ${garbageMarkersJS}
        </script>
      </body>
      </html>
    `;
  };

  // Renderizado condicional basado en el estado
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: generateMapHTML() }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
      
      {/* Información adicional sobre los puntos cargados */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          📍 {garbagePoints.length} punto{garbagePoints.length !== 1 ? 's' : ''} de basura
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoBar: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});