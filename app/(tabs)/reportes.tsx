import React from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useGarbagePoints, type GarbagePoint } from '../../hooks/useGarbagePoints';

export default function ReportesScreen() {
  // Usar nuestro hook para obtener datos en tiempo real
  const { 
    garbagePoints, 
    loading, 
    error, 
    refresh, 
    totalCount, 
    verifiedCount, 
    cleanedCount 
  } = useGarbagePoints({ 
    realTime: true,
    orderByField: 'createdAt'
  });

  const formatDate = (date: Date | any): string => {
    const dateObj = date?.toDate ? date.toDate() : date;
    
    if (!dateObj || !(dateObj instanceof Date)) {
      return 'Fecha inválida';
    }

    return dateObj.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string = 'pending'): string => {
    switch (status) {
      case 'verified': return '#4CAF50';
      case 'cleaned': return '#2196F3';
      default: return '#FF9800';
    }
  };

  const getStatusText = (status: string = 'pending'): string => {
    switch (status) {
      case 'verified': return 'Verificado';
      case 'cleaned': return 'Limpiado';
      default: return 'Pendiente';
    }
  };

  const getStatusIcon = (status: string = 'pending'): string => {
    switch (status) {
      case 'verified': return '✅';
      case 'cleaned': return '🧹';
      default: return '⏳';
    }
  };

  const handleReportPress = (report: GarbagePoint) => {
    Alert.alert(
      'Detalles del Reporte',
      `${getStatusIcon(report.status)} Estado: ${getStatusText(report.status)}\n\n` +
      `📍 Ubicación:\n${report.gps.latitude.toFixed(6)}, ${report.gps.longitude.toFixed(6)}\n\n` +
      `📅 Fecha: ${formatDate(report.createdAt)}\n\n` +
      `🎯 Precisión GPS: ±${Math.round(report.gps.accuracy || 0)}m`,
      [
        { text: 'Ver en Mapa', onPress: () => {
          console.log('Navegar a mapa con punto:', report.id);
        }},
        { text: 'Cerrar', style: 'cancel' }
      ]
    );
  };

  const calculateImpactScore = (): number => {
    return (cleanedCount * 10) + (verifiedCount * 5) + (totalCount * 1);
  };

  const renderReportItem = ({ item }: { item: GarbagePoint }) => (
    <TouchableOpacity 
      style={styles.reportItem}
      onPress={() => handleReportPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.photoUrl ? (
          <Image 
            source={{ uri: item.photoUrl }} 
            style={styles.reportImage}
            onError={() => console.log('Error cargando imagen:', item.photoUrl)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷</Text>
          </View>
        )}
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
        </View>
      </View>

      <View style={styles.reportInfo}>
        <Text style={styles.reportDate}>{formatDate(item.createdAt)}</Text>
        <Text style={styles.reportLocation}>
          📍 {item.gps.latitude.toFixed(4)}, {item.gps.longitude.toFixed(4)}
        </Text>
        <Text style={styles.reportStatus}>
          {getStatusIcon(item.status)} {getStatusText(item.status)}
        </Text>
        {item.gps.accuracy && (
          <Text style={styles.accuracy}>
            🎯 Precisión: ±{Math.round(item.gps.accuracy)}m
          </Text>
        )}
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>No hay reportes aún</Text>
      <Text style={styles.emptySubtitle}>
        ¡Toma tu primera foto de basura para comenzar a contribuir con tu comunidad!
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingIcon}>🔄</Text>
      <Text style={styles.loadingText}>Cargando tus reportes...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Error de conexión</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refresh}>
        <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && garbagePoints.length === 0) {
    return renderLoadingState();
  }

  if (error && garbagePoints.length === 0) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Tus Reportes</Text>
          <Text style={styles.impactScore}>⭐ {calculateImpactScore()} pts</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: getStatusColor('verified') }]}>
              {verifiedCount}
            </Text>
            <Text style={styles.statLabel}>Verificados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: getStatusColor('cleaned') }]}>
              {cleanedCount}
            </Text>
            <Text style={styles.statLabel}>Limpiados</Text>
          </View>
        </View>

        {totalCount > 0 && (
          <Text style={styles.motivationalText}>
            {cleanedCount > 0 
              ? `¡Increíble! Has ayudado a limpiar ${cleanedCount} punto${cleanedCount > 1 ? 's' : ''} de basura 🎉`
              : `¡Sigue así! Tienes ${totalCount} reporte${totalCount > 1 ? 's' : ''} contribuyendo a una ciudad más limpia 💪`
            }
          </Text>
        )}
      </View>

      {/* Lista de reportes */}
      <FlatList
        data={garbagePoints}
        keyExtractor={(item) => item.id}
        renderItem={renderReportItem}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            tintColor="#00ffcc"
            colors={["#00ffcc"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={garbagePoints.length === 0 ? styles.emptyList : styles.list}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Header con estadísticas
  statsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  impactScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ffcc',
    backgroundColor: '#f0fffe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  motivationalText: {
    fontSize: 14,
    color: '#00ffcc',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },

  // Lista
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },

  // Items
  reportItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  reportImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 24,
  },

  statusBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 12,
  },

  reportInfo: {
    flex: 1,
  },
  reportDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  reportStatus: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  accuracy: {
    fontSize: 12,
    color: '#999999',
  },

  arrow: {
    fontSize: 20,
    color: '#cccccc',
    marginLeft: 8,
  },

  // Estados
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00ffcc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
});