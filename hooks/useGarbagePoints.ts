// hooks/useGarbagePoints.ts
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/firebase';

// Interfaz para un punto de basura (consistente con tu GarbageMap)
export interface GarbagePoint {
  id: string;
  gps: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  photoId: string;
  photoUrl?: string; // URL de la foto desde Storage
  createdAt: Timestamp | Date;
  status?: 'pending' | 'verified' | 'cleaned';
  userId?: string; // Para filtrar por usuario específico
}

// Opciones para configurar el hook
interface UseGarbagePointsOptions {
  realTime?: boolean; // Si debe usar listener en tiempo real
  userId?: string; // Para filtrar por usuario específico
  limit?: number; // Límite de documentos a cargar
  orderByField?: 'createdAt' | 'status'; // Campo para ordenar
}

// Tipo de retorno del hook
interface UseGarbagePointsReturn {
  garbagePoints: GarbagePoint[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  totalCount: number;
  verifiedCount: number;
  cleanedCount: number;
}

/**
 * Hook personalizado para manejar los puntos de basura desde Firebase
 * 
 * Este hook centraliza toda la lógica de carga y gestión de datos de puntos
 * de basura, proporcionando una interfaz consistente para todos los componentes
 * que necesiten acceder a esta información.
 * 
 * @param options - Configuración opcional para personalizar el comportamiento
 * @returns Objeto con datos, estados de carga, errores y funciones útiles
 */
export function useGarbagePoints(options: UseGarbagePointsOptions = {}): UseGarbagePointsReturn {
  const {
    realTime = false,
    userId,
    limit,
    orderByField = 'createdAt'
  } = options;

  // Estados principales del hook
  const [garbagePoints, setGarbagePoints] = useState<GarbagePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Construye la query de Firebase basándose en las opciones proporcionadas
   * Esta función centraliza la lógica de construcción de queries para
   * mantener consistencia en toda la aplicación
   */
  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'garbagePoints'));

    // Agregar filtro por usuario si se especifica
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }

    // Agregar ordenamiento
    q = query(q, orderBy(orderByField, 'desc'));

    // Agregar límite si se especifica
    if (limit) {
      // Note: limit() requiere importación adicional de Firebase
      // q = query(q, limit(limit));
    }

    return q;
  }, [userId, orderByField, limit]);

  /**
   * Procesa los documentos de Firebase y los convierte a nuestro formato
   * Esta función también calcula estadísticas útiles como conteos por estado
   */
  const processGarbagePoints = useCallback((querySnapshot: any) => {
    const points: GarbagePoint[] = [];
    
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      
      // Validar que los datos mínimos requeridos estén presentes
      if (data.gps && data.gps.latitude && data.gps.longitude) {
        points.push({
          id: doc.id,
          gps: data.gps,
          photoId: data.photoId,
          photoUrl: data.photoUrl || '',
          createdAt: data.createdAt,
          status: data.status || 'pending',
          userId: data.userId,
        });
      }
    });

    return points;
  }, []);

  /**
   * Carga los datos una sola vez desde Firebase
   * Útil para componentes que no necesitan actualizaciones en tiempo real
   */
  const loadGarbagePointsOnce = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const q = buildQuery();
      const querySnapshot = await getDocs(q);
      const points = processGarbagePoints(querySnapshot);
      
      setGarbagePoints(points);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando puntos de basura';
      setError(errorMessage);
      console.error('Error en loadGarbagePointsOnce:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, processGarbagePoints]);

  /**
   * Configura un listener en tiempo real para actualizaciones automáticas
   * Útil para pantallas como el mapa que necesitan mostrar cambios inmediatamente
   */
  const setupRealtimeListener = useCallback(() => {
    const q = buildQuery();
    
    // Configurar el listener de Firebase
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const points = processGarbagePoints(querySnapshot);
          setGarbagePoints(points);
          setError(null);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error procesando datos en tiempo real';
          setError(errorMessage);
          console.error('Error en listener tiempo real:', err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Error de conexión con Firebase');
        setLoading(false);
        console.error('Error en onSnapshot:', err);
      }
    );

    return unsubscribe;
  }, [buildQuery, processGarbagePoints]);

  /**
   * Función para refrescar manualmente los datos
   * Útil para implementar pull-to-refresh en listas
   */
  const refresh = useCallback(async () => {
    await loadGarbagePointsOnce();
  }, [loadGarbagePointsOnce]);

  // Efecto principal que carga los datos según la configuración
  useEffect(() => {
    if (realTime) {
      // Configurar listener en tiempo real
      const unsubscribe = setupRealtimeListener();
      return () => unsubscribe(); // Cleanup al desmontar el componente
    } else {
      // Cargar datos una sola vez
      loadGarbagePointsOnce();
    }
  }, [realTime, setupRealtimeListener, loadGarbagePointsOnce]);

  // Calcular estadísticas útiles basadas en los datos actuales
  const totalCount = garbagePoints.length;
  const verifiedCount = garbagePoints.filter(point => point.status === 'verified').length;
  const cleanedCount = garbagePoints.filter(point => point.status === 'cleaned').length;

  // Retornar todo lo que los componentes necesitan
  return {
    garbagePoints,
    loading,
    error,
    refresh,
    totalCount,
    verifiedCount,
    cleanedCount,
  };
}