import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useGarbagePoints } from '../../hooks/useGarbagePoints';

// Interfaz para configuraciones del usuario
interface UserSettings {
  notifications: boolean;
  locationTracking: boolean;
  publicProfile: boolean;
  autoSync: boolean;
}

export default function PerfilScreen() {
  // Usar nuestro hook para obtener estadísticas del usuario
  // No necesitamos tiempo real aquí, los datos se cargan al abrir la pantalla
  const { 
    totalCount, 
    verifiedCount, 
    cleanedCount, 
    loading,
    garbagePoints 
  } = useGarbagePoints({ 
    realTime: false, // No necesitamos actualizaciones constantes en el perfil
    orderByField: 'createdAt'
  });
  
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    locationTracking: true,
    publicProfile: false,
    autoSync: true,
  });

  /**
   * Calcula estadísticas avanzadas basadas en los datos reales
   * Estas métricas ayudan al usuario a entender su impacto en la comunidad
   */
  const calculateAdvancedStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    // Filtrar reportes de este mes
    const thisMonthReports = garbagePoints.filter(point => {
      const reportDate = point.createdAt?.toDate ? point.createdAt.toDate() : point.createdAt;
      return reportDate && 
             reportDate.getMonth() === thisMonth && 
             reportDate.getFullYear() === thisYear;
    }).length;

    // Calcular tasa de completación (reportes que resultaron en limpieza)
    const completionRate = totalCount > 0 ? Math.round((cleanedCount / totalCount) * 100) : 0;
    
    // Calcular puntos de impacto (misma fórmula que en Reportes)
    const impactScore = (cleanedCount * 10) + (verifiedCount * 5) + (totalCount * 1);
    
    // Calcular racha de días consecutivos (simplificado)
    const streakDays = Math.min(totalCount, 7); // Por ahora, máximo 7 días
    
    return {
      thisMonthReports,
      completionRate,
      impactScore,
      streakDays,
    };
  };

  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    try {
      // Actualizar estado local inmediatamente para respuesta rápida
      setSettings(prev => ({ ...prev, [key]: value }));
      
      // En una implementación real, aquí guardarías en Firebase o AsyncStorage
      console.log(`Configuración ${key} actualizada a:`, value);
      
      // Mostrar mensajes informativos para cambios importantes
      if (key === 'locationTracking' && !value) {
        Alert.alert(
          'Ubicación desactivada',
          'Sin la ubicación, no podrás crear nuevos reportes de basura. Puedes reactivar esta opción en cualquier momento.',
          [{ text: 'Entendido' }]
        );
      }
      
      if (key === 'autoSync' && value) {
        Alert.alert(
          'Sincronización automática activada',
          'Tus fotos se subirán automáticamente cuando tengas conexión a internet.',
          [{ text: 'Perfecto' }]
        );
      }
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      // Revertir cambio si hay error
      setSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert('Error', 'No se pudo actualizar la configuración. Intenta de nuevo.');
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar Datos',
      'Próximamente podrás exportar todos tus reportes en formato CSV para análisis personal.',
      [{ text: 'Entendido' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '⚠️ Esta acción no se puede deshacer. Se eliminarán todos tus reportes y datos.\n\n¿Estás completamente seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          Alert.alert(
            'Confirmación Final',
            'Escribe "ELIMINAR" para confirmar la eliminación permanente de tu cuenta.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Proceder', style: 'destructive', onPress: () => {
                console.log('Proceso de eliminación de cuenta iniciado');
              }}
            ]
          );
        }}
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contactar Soporte',
      'Puedes contactarnos a través de:\n\n📧 soporte@spotmytrash.com\n📱 WhatsApp: +56 9 XXXX XXXX\n\nTiempo de respuesta: 24-48 horas',
      [{ text: 'OK' }]
    );
  };

  const stats = calculateAdvancedStats();

  // Mostrar estado de carga simplificado
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>⚡</Text>
        <Text style={styles.loadingText}>Cargando tu perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header del Usuario */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>🌱</Text>
        </View>
        <Text style={styles.userName}>EcoGuardián</Text>
        <Text style={styles.userSubtitle}>Miembro de SpotMyTrash</Text>
        <Text style={styles.impactBadge}>⭐ {stats.impactScore} puntos de impacto</Text>
      </View>

      {/* Estadísticas Principales */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Tu Impacto Ambiental</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryStatCard]}>
            <Text style={styles.primaryStatNumber}>{totalCount}</Text>
            <Text style={styles.primaryStatLabel}>Reportes Totales</Text>
            <Text style={styles.statSubtext}>🏆 ¡Contribuyendo al cambio!</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.secondaryStatCard}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{verifiedCount}</Text>
              <Text style={styles.statLabel}>✅ Verificados</Text>
            </View>
            
            <View style={styles.secondaryStatCard}>
              <Text style={[styles.statNumber, { color: '#2196F3' }]}>{cleanedCount}</Text>
              <Text style={styles.statLabel}>🧹 Limpiados</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.secondaryStatCard}>
              <Text style={[styles.statNumber, { color: '#00ffcc' }]}>{stats.thisMonthReports}</Text>
              <Text style={styles.statLabel}>📅 Este Mes</Text>
            </View>
            
            <View style={styles.secondaryStatCard}>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.completionRate}%</Text>
              <Text style={styles.statLabel}>✨ Efectividad</Text>
            </View>
          </View>
        </View>

        {/* Barra de progreso hacia la próxima meta */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progreso hacia los 50 reportes 🎯</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((totalCount / 50) * 100, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {50 - totalCount > 0 ? `${50 - totalCount} reportes más para alcanzar la meta` : '¡Meta alcanzada! 🎉'}
          </Text>
        </View>
      </View>

      {/* Configuraciones */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>🔔 Notificaciones</Text>
            <Text style={styles.settingDescription}>
              Alertas sobre verificaciones y limpiezas de tus reportes
            </Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
            trackColor={{ false: '#e0e0e0', true: '#00ffcc' }}
            thumbColor={settings.notifications ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>📍 Seguimiento de Ubicación</Text>
            <Text style={styles.settingDescription}>
              Necesario para crear reportes con coordenadas precisas
            </Text>
          </View>
          <Switch
            value={settings.locationTracking}
            onValueChange={(value) => updateSetting('locationTracking', value)}
            trackColor={{ false: '#e0e0e0', true: '#00ffcc' }}
            thumbColor={settings.locationTracking ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>🌐 Perfil Público</Text>
            <Text style={styles.settingDescription}>
              Aparecer en el ranking comunitario de contribuidores
            </Text>
          </View>
          <Switch
            value={settings.publicProfile}
            onValueChange={(value) => updateSetting('publicProfile', value)}
            trackColor={{ false: '#e0e0e0', true: '#00ffcc' }}
            thumbColor={settings.publicProfile ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>☁️ Sincronización Automática</Text>
            <Text style={styles.settingDescription}>
              Subir fotos automáticamente cuando haya conexión wifi
            </Text>
          </View>
          <Switch
            value={settings.autoSync}
            onValueChange={(value) => updateSetting('autoSync', value)}
            trackColor={{ false: '#e0e0e0', true: '#00ffcc' }}
            thumbColor={settings.autoSync ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Text style={styles.actionButtonText}>📊 Exportar Mis Datos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleContactSupport}>
          <Text style={styles.actionButtonText}>💬 Contactar Soporte</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📖 Acerca de SpotMyTrash</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={handleDeleteAccount}
        >
          <Text style={styles.dangerButtonText}>⚠️ Eliminar Cuenta</Text>
        </TouchableOpacity>
      </View>

      {/* Footer con versión */}
      <View style={styles.footerSection}>
        <Text style={styles.footerText}>SpotMyTrash v1.0.0</Text>
        <Text style={styles.footerText}>Construyendo ciudades más limpias, juntos</Text>
      </View>

      {/* Espacio extra para el scroll */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Estado de carga
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

  // Sección de usuario
  userSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fff0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#00ffcc',
  },
  avatarText: {
    fontSize: 36,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  impactBadge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ffcc',
    backgroundColor: '#f0fff0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffcc',
  },

  // Secciones generales
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },

  // Estadísticas
  statsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  statsGrid: {
    marginBottom: 24,
  },
  primaryStatCard: {
    backgroundColor: '#f0fff0',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00ffcc',
  },
  primaryStatNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#00ffcc',
    marginBottom: 8,
  },
  primaryStatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  secondaryStatCard: {
    width: (width - 60) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },

  // Barra de progreso
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffcc',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
  },

  // Configuraciones
  settingsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },

  // Acciones
  actionsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },

  // Footer
  footerSection: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },

  // Espaciado inferior
  bottomSpacing: {
    height: 32,
  },
});