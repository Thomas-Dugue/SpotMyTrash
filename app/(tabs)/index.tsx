import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import GarbageMap from '../components/garbageMap'; // Tu componente existente

export default function HomeScreen() {
  const router = useRouter();

  const handleReportPhoto = () => {
    // Navegar a la pantalla de cámara
    router.push("../Camera");
  };

  return (
    <View style={styles.container}>
      {/* Tu componente de mapa existente ocupa toda la pantalla */}
      <View style={styles.mapContainer}>
        <GarbageMap />
      </View>

      {/* Botón flotante "Reporte Foto" sobre el mapa */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={handleReportPhoto}
          activeOpacity={0.8}
        >
          <Text style={styles.reportButtonText}>📸 Reporte Foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Fondo blanco como especificaste
  },
  
  // Contenedor del mapa - tu componente GarbageMap
  mapContainer: {
    flex: 1, // Ocupa todo el espacio disponible
  },

  // Contenedor del botón principal flotante
  buttonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90, // Espacio para tab bar
    left: 20,
    right: 20,
    alignItems: 'center',
    // Sombra para que se vea bien sobre el mapa
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Botón "Reporte Foto" - Siguiendo tu paleta de colores
  reportButton: {
    backgroundColor: '#00ffcc', // Tu color principal
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25, // Más redondeado para un look moderno
    minWidth: 200,
    // Sombra más pronunciada para destacar sobre el mapa
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  reportButtonText: {
    color: '#000000', // Texto negro como especificaste
    fontSize: 18,
    fontWeight: '700', // Más bold para mayor visibilidad
    textAlign: 'center',
    letterSpacing: 0.5, // Espaciado de letras para mejor legibilidad
  },
});