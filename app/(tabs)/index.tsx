import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useGarbagePoints } from '../../hooks/useGarbagePoints';
import GarbageMap from '../components/garbageMap'; // Tu componente existente (ahora mejorado)

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current; // Para animación del popup
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [nearbyCount, setNearbyCount] = useState(0);
  
  // Usar nuestro hook para obtener datos en tiempo real
  const { garbagePoints, refresh } = useGarbagePoints({ realTime: true });

  // Función para calcular distancia entre dos puntos GPS (fórmula de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en metros
  };

  // Función para contar puntos de basura en un radio de 100 metros
  const countNearbyGarbagePoints = (userLat: number, userLon: number): number => {
    return garbagePoints.filter(point => {
      const distance = calculateDistance(
        userLat, 
        userLon, 
        point.gps.latitude, 
        point.gps.longitude
      );
      return distance <= 100; // Filtrar puntos dentro de 100 metros
    }).length;
  };

  // Obtener ubicación del usuario
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        setUserLocation(newLocation);
        
        // Calcular puntos cercanos cuando tenemos ubicación
        if (garbagePoints.length > 0) {
          const count = countNearbyGarbagePoints(newLocation.latitude, newLocation.longitude);
          setNearbyCount(count);
        }
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
      }
    };

    getCurrentLocation();
  }, [garbagePoints]); // Recalcular cuando cambien los puntos de basura

  // Función para mostrar popup cuando se toma una foto
  const showNearbyPointsPopup = () => {
    if (!userLocation) return;
    
    // Recalcular puntos cercanos
    const count = countNearbyGarbagePoints(userLocation.latitude, userLocation.longitude);
    setNearbyCount(count);
    setShowPopup(true);
    
    // Animación de entrada del popup
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Ocultar popup después de 10 segundos
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowPopup(false);
      });
    }, 10000); // 10 segundos
  };

  const handleReportPhoto = () => {
    // Navegar a la pantalla de cámara
    router.push("../Camera");
    
    // Mostrar popup cuando el usuario regrese
    setTimeout(() => {
      showNearbyPointsPopup();
    }, 100);
  };

  return (
    <View style={styles.container}>
      {/* Tu componente de mapa existente ocupa toda la pantalla */}
      <View style={styles.mapContainer}>
        <GarbageMap />
      </View>

      {/* Popup de información sobre puntos cercanos */}
      {showPopup && (
        <Animated.View 
          style={[
            styles.infoPopup, 
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.popupIcon}>📍</Text>
          <Text style={styles.popupText}>
            {nearbyCount} punto{nearbyCount !== 1 ? 's' : ''} de basura
          </Text>
          <Text style={styles.popupSubtext}>
            en un radio de 100m
          </Text>
        </Animated.View>
      )}

      {/* Botón flotante "Reporte Foto" con especificaciones exactas */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={handleReportPhoto}
          activeOpacity={0.8}
        >
          <Text style={styles.cameraIcon}>📸</Text>
          <Text style={styles.reportButtonText}>Reporte Foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Contenedor del mapa
  mapContainer: {
    flex: 1,
  },

  // Popup de información sobre puntos cercanos
  infoPopup: {
    position: 'absolute',
    top: 20, // Debajo del header permanente
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    
    // Sombra para destacar sobre el mapa
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    
    // Borde sutil
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.3)',
  },
  popupIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  popupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  popupSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },

  // Contenedor del botón principal
  buttonContainer: {
    position: 'absolute',
    bottom: 100, // 20 píxeles del borde inferior como especificaste
    left: 20,
    right: 20,
    alignItems: 'center',
  },

  // Botón "Reporte Foto" con tus especificaciones exactas:
  // - Altura reducida en 20px
  // - Ancho reducido en 20%
  // - 20 pixels del borde inferior
  reportButton: {
    backgroundColor: '#00ffcc', // Tu color principal
    flexDirection: 'row', // Para alinear icono y texto
    alignItems: 'center',
    justifyContent: 'center',
    
    // Dimensiones ajustadas según tus especificaciones
    paddingVertical: 14, // Reducido (era 18, ahora 14 = -4px en altura total)
    paddingHorizontal: 32,
    minWidth: width * 0.6, // 60% del ancho (-20% de lo original que era 80%)
    
    borderRadius: 25,
    
    // Sombra pronunciada
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cameraIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  reportButtonText: {
    color: '#000000', // Texto negro
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});