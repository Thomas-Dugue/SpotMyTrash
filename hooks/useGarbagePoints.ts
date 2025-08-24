// hooks/useGarbagePoints.ts
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/firebase';

// Interfaz para un punto de basura
export interface GarbagePoint {
  id: string;
  gps: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  photoId: string;
  photoUrl?: string;
  createdAt: Timestamp | Date;
  status?: 'pending' | 'verified' | 'cleaned';
  userId?: string;
}

// Opciones para configurar el hook
interface UseGarbagePointsOptions {
  realTime?: boolean;
  userId?: string;
  limit?: number;
  orderByField?: 'createdAt' | 'status';
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

export function useGarbagePoints(options: UseGarbagePointsOptions = {}): UseGarbagePointsReturn {
  const {
    realTime = false,
    userId,
    limit,
    orderByField = 'createdAt'
  } = options;

  const [garbagePoints, setGarbagePoints] = useState<GarbagePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    let q = query(collection(db, 'garbagePoints'));
    q = query(q, orderBy(orderByField, 'desc'));
    return q;
  }, [userId, orderByField, limit]);

  const processGarbagePoints = useCallback((querySnapshot: any) => {
    const points: GarbagePoint[] = [];
    
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      
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

  const setupRealtimeListener = useCallback(() => {
    const q = buildQuery();
    
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

  const refresh = useCallback(async () => {
    await loadGarbagePointsOnce();
  }, [loadGarbagePointsOnce]);

  useEffect(() => {
    if (realTime) {
      const unsubscribe = setupRealtimeListener();
      return () => unsubscribe();
    } else {
      loadGarbagePointsOnce();
    }
  }, [realTime, setupRealtimeListener, loadGarbagePointsOnce]);

  const totalCount = garbagePoints.length;
  const verifiedCount = garbagePoints.filter(point => point.status === 'verified').length;
  const cleanedCount = garbagePoints.filter(point => point.status === 'cleaned').length;

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