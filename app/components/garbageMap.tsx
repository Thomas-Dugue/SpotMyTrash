// components/garbageMap.tsx
import * as Location from 'expo-location';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
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
  const [latestPointId, setLatestPointId] = useState<string | null>(null);

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
      // NUEVO: Ahora ordenados por fecha para identificar el más reciente
      const q = query(
        collection(db, 'garbagePoints'),
        orderBy('createdAt', 'desc') // Ordenar por fecha
      );
      const querySnapshot = await getDocs(q);
      
      // Convertimos los documentos de Firebase a nuestro formato de datos
      const points: GarbagePoint[] = [];
      let isFirst = true; // Para identificar el primer elemento (más reciente)
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Validamos que los datos tengan la estructura esperada
        if (data.gps && data.gps.latitude && data.gps.longitude) {
          // El primer elemento es nuestro último punto creado
          if (isFirst) {
            setLatestPointId(doc.id);
            isFirst = false;
          }
          
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

    // NUEVO: Marcadores con lógica especial para el último creado
    const garbageMarkersJS = garbagePoints.map(point => {
      const isLatest = point.id === latestPointId;
      const markerColor = isLatest ? '#00e6b8' : '#ff4444'; // Color especial para el último
      const animationClass = isLatest ? 'pulse-marker' : '';
      
      return `
        L.marker([${point.gps.latitude}, ${point.gps.longitude}], {
          icon: L.divIcon({
            className: 'custom-marker ${animationClass}',
            html: '<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          })
        })
        .addTo(map)
        .bindPopup("${isLatest ? '✨ Último reporte' : 'Basura reportada'}<br>ID: ${point.id}")
        ${isLatest ? '.openPopup()' : ''};
      `;
    }).join('\n');

    // Generamos el marcador del usuario si tenemos su ubicación
    const userMarkerJS = userLocation ? 
      `L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMwMDc4ZmYiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map).bindPopup("📍 Tu ubicación actual");` : '';

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
          
          /* NUEVO: Animación de pulsación para el último marcador creado */
          .pulse-marker {
            animation: pulseAnimation 2s ease-in-out infinite;
            animation-duration: 20s; /* 20 segundos como especificaste */
          }
          
          @keyframes pulseAnimation {
            0%, 100% { 
              transform: scale(0.95); /* -5% del tamaño original */
            }
            50% { 
              transform: scale(1.05); /* +5% del tamaño original */
            }
          }
          
          /* NUEVO: Estilos para marcadores personalizados */
          .custom-marker {
            background: transparent;
            border: none;
          }
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
          
          // NUEVO: Añadimos todos los marcadores con animación especial para el último
          ${garbageMarkersJS}
          
          // NUEVO: Detener animación después de 20 segundos
          setTimeout(() => {
            const pulsingMarkers = document.querySelectorAll('.pulse-marker');
            pulsingMarkers.forEach(marker => {
              marker.classList.remove('pulse-marker');
            });
          }, 20000);
        </script>
      </body>
      </html>
    `;
  };

  // Renderizado condicional basado en el estado
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00ffcc" />
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
});