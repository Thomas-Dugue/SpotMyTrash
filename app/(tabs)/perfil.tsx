// app/(tabs)/perfil.tsx - Versión con importaciones corregidas
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
// Importación corregida usando el alias @/
import { useGarbagePoints } from '@/hooks/useGarbagePoints';

// Interfaz para configuraciones del usuario
interface UserSettings {
  notifications: boolean;
  locationTracking: boolean;
  publicProfile: boolean;
  autoSync: boolean;
}

export default function PerfilScreen() {
  // Hook optimizado para perfil - no necesita tiempo real constante
  const { 
    garbagePoints,
    totalCount, 
    verifiedCount, 
    cleanedCount, 
    loading,
    refresh
  } = useGarbagePoints({ 
    realTime: false, // Carga una vez al abrir la pantalla
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
   * Incluye métricas de impacto y progreso del usuario
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

    // Calcular tasa de efectividad (reportes que resultaron en limpieza o verificación)
    const effectiveReports = verifiedCount + cleanedCount;
    const effectivenessRate = totalCount > 0 ? Math.round((effectiveReports / totalCount) * 100) : 0;
    
    // Sistema de puntos más sofisticado
    const impactScore = (cleanedCount * 15) + (verifiedCount * 8) + (totalCount * 3);
    
    // Calcular racha de días (simulado - en producción vendría de Firebase)
    const streakDays = Math.min(Math.floor(totalCount / 2) + 1, 30);
    
    // Calcular nivel de usuario basado en puntos
    const userLevel = Math.floor(impactScore / 100) + 1;
    const pointsToNextLevel = ((userLevel) * 100) - impactScore;
    
    return {
      thisMonthReports,
      effectivenessRate,
      impactScore,
      streakDays,
      userLevel,
      pointsToNextLevel: Math.max(pointsToNextLevel, 0),
    };
  };

  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    try {
      // Actualizar estado local inmediatamente para respuesta rápida
      setSettings(prev => ({ ...prev, [key]: value }));
      
      // En una implementación real, aquí guardarías en Firebase o AsyncStorage
      console.log(`⚙️ Configuración ${key} actualizada a:`, value);
      
      // Mensajes informativos para cambios importantes
      if (key === 'locationTracking' && !value) {
        Alert.alert(
          '📍 Ubicación desactivada',
          'Sin la ubicación, no podrás crear nuevos reportes de basura. Puedes reactivar esta opción en cualquier momento.',
          [{ text: 'Entendido' }]
        );
      }
      
      if (key === 'autoSync' && value) {
        Alert.alert(
          '☁️ Sincronización automática activada',
          'Tus fotos se subirán automáticamente cuando tengas conexión a WiFi, ahorrando datos móviles.',
          [{ text: 'Perfecto' }]
        );
      }

      if (key === 'publicProfile' && value) {
        Alert.alert(
          '🌟 Perfil público activado',
          'Ahora aparecerás en el ranking comunitario de contribuidores. ¡Tu impacto será visible para otros usuarios!',
          [{ text: '¡Genial!' }]
        );
      }
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
      // Revertir cambio si hay error
      setSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert('Error', 'No se pudo actualizar la configuración. Intenta de nuevo.');
    }
  };

  const handleExportData = () => {
    if (totalCount === 0) {
      Alert.alert(
        'Sin datos para exportar',
        'Aún no tienes reportes para exportar. ¡Crea tu primer reporte tomando una foto de basura!',
        [{ text: 'Entendido' }]
      );
      return;
    }

    Alert.alert(
      '📊 Exportar Datos',
      `Exportar ${totalCount} reporte${totalCount > 1 ? 's' : ''} en formato CSV incluyendo:\n\n` +
      '• Ubicaciones GPS\n' +
      '• Fechas y horas\n' +
      '• Estados de verificación\n' +
      '• Enlaces a fotos\n\n' +
      'El archivo se guardará en tu dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Exportar', onPress: () => {
          // TODO: Implementar exportación real
          console.log('📄 Iniciando exportación de datos...');
          Alert.alert('Exportación iniciada', 'Tu archivo CSV estará listo en unos momentos.');
        }}
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Eliminar Cuenta',
      `Esta acción eliminará permanentemente:\n\n` +
      `• ${totalCount} reporte${totalCount !== 1 ? 's' : ''} de basura\n` +
      `• Todas tus fotos\n` +
      `• Tu progreso y estadísticas\n` +
      `• Configuración personalizada\n\n` +
      `Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          Alert.alert(
            'Confirmación Final',
            'Para confirmar la eliminación permanente, escribe "ELIMINAR CUENTA" en el siguiente diálogo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Proceder', style: 'destructive', onPress: () => {
                // TODO: Implementar eliminación real de cuenta
                console.log('🗑️ Proceso de eliminación de cuenta iniciado');
              }}
            ]
          );
        }}
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      '💬 Contactar Soporte',
      'Estamos aquí para ayudarte:\n\n' +
      '📧 soporte@spotmytrash.com\n' +
      '📱 WhatsApp: +56 9 1234 5678\n' +
      '🌐 Web: spotmytrash.com/ayuda\n\n' +
      '⏱️ Tiempo de respuesta: 24-48 horas\n' +
      '🇨🇱 Soporte en español',
      [
        { text: 'Cerrar' },
        { text: 'Abrir WhatsApp', onPress: () => {
          // TODO: Implementar apertura de WhatsApp
          console.log('📱 Abriendo WhatsApp...');
        }}
      ]
    );
  };

  const handleAboutApp = () => {
    Alert.alert(
      '📱 Acerca de SpotMyTrash',
      'SpotMyTrash v1.0.0\n\n' +
      '🌱 Construyendo ciudades más limpias, juntos\n\n' +
      'Una iniciativa para mapear y limpiar la basura urbana usando la tecnología y el poder de la comunidad.\n\n' +
      '© 2024 SpotMyTrash Team\n' +
      'Desarrollado con ❤️ en Chile',
      [{ text: 'Cerrar' }]
    );
  };

  const stats = calculateAdvancedStats();

  // Determinar el título/badge del usuario basado en su nivel
  const getUserTitle = (level: number): string => {
    if (level >= 10) return '🏆 Guardián Maestro';
    if (level >= 7) return '⭐ Guardián Experto';
    if (level >= 5) return '🌟 Guardián Avanzado';
    if (level >= 3) return '🌱 Guardián Activo';
    if (level >= 2) return '🌿 Eco Voluntario';
    return '🌱 Eco Principiante';
  };

  // Mostrar estado de carga mejorado
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>🌱</Text>
        <Text style={styles.loadingText}>Cargando tu perfil...</Text>
        <Text style={styles.loadingSubtext}>Calculando tu impacto ambiental</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header del Usuario Mejorado */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>🌍</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{stats.userLevel}</Text>
          </View>
        </View>
        <Text style={styles.userName}>Eco Guardián</Text>
        <Text style={styles.userTitle}>{getUserTitle(stats.userLevel)}</Text>
        <View style={styles.impactBadgeContainer}>
          <Text style={styles.impactBadge}>⭐ {stats.impactScore} puntos de impacto</Text>
        </View>
        
        {/* Progreso hacia siguiente nivel */}
        {stats.pointsToNextLevel > 0 && (
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>
              {stats.pointsToNextLevel} puntos para nivel {stats.userLevel + 1}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.max(10, 100 - (stats.pointsToNextLevel / 100) * 100)}%`
                  }
                ]}
              />
            </View>
          </View>
        )}
      </View>

      {/* Estadísticas Principales Mejoradas */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Tu Impacto Ambiental 🌱</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryStatCard]}>
            <Text style={styles.primaryStatNumber}>{totalCount}</Text>
            <Text style={styles.primaryStatLabel}>Reportes Totales</Text>
            <Text style={styles.statSubtext}>
              {totalCount === 0 
                ? '¡Toma tu primera foto!' 
                : totalCount < 5 
                ? '🚀 ¡Gran comienzo!' 
                : '🏆 ¡Impacto increíble!'}
            </Text>
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
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.effectivenessRate}%</Text>
              <Text style={styles.statLabel}>✨ Efectividad</Text>
            </View>
          </View>
        </View>

        {/* Logros y Estadísticas Adicionales */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsTitle}>🏅 Logros</Text>
          <View style={styles.achievementsList}>
            <View style={styles.achievement}>
              <Text style={styles.achievementIcon}>🔥</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>Racha Activa</Text>
                <Text style={styles.achievementDesc}>{stats.streakDays} días consecutivos</Text>
              </View>
            </View>
            
            <View style={styles.achievement}>
              <Text style={styles.achievementIcon}>🎯</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>Precisión</Text>
                <Text style={styles.achievementDesc}>
                  {stats.effectivenessRate}% de reportes efectivos
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Configuraciones */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>⚙️ Configuración</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>🔔 Notificaciones</Text>
            <Text style={styles.settingDescription}>
              Recibe alertas sobre verificaciones y limpiezas de tus reportes
            </Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
            trackColor={{ false: '#e0e0e0', true: '#00ffcc' }}
            thumbColor={settings.notifications ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#e0e0e0"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>📍 Seguimiento de Ubicación</Text>
            <Text style={styles.settingDescription}>
              Necesario para crear reportes con coordenadas GPS precisas
            </Text>
          </View>
          <Switch
            value={settings.locationTracking}
            onValueChange={(value) => updateSetting('locationTracking', value)}
            trackColor={{ false: '#e0e0e0', true: '#00ffcc' }}
            thumbColor={settings.locationTracking ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#e0e0e0"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>🌐 Perfil Público</Text>
            <Text style={styles.settingDescription}>
              Aparecer en el ranking comunitario de contribuidores más activos
            </Text>
          </View>
          <Switch
            value={settings.publicProfile}
            onValueChange={(value) => updateSetting('publicProfile', value)}
            trackColor={{ false: '#e0e0e0', true: '#00ffcc' }}
            thumbColor={settings.publicProfile ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#e0e0e0"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>☁️ Sincronización Automática</Text>
            <Text style={styles.settingDescription}>
              Subir fotos automáticamente cuando hay conexión WiFi disponible
            </Text>
          </View>
          <Switch
            value={settings.autoSync}
            onValueChange={(value) => updateSetting('autoSync', value)}
            trackColor={{ false: '#e0e0e0', true: '#00ffcc' }}
            thumbColor={settings.autoSync ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#e0e0e0"
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
        
        <TouchableOpacity style={styles.actionButton} onPress={handleAboutApp}>
          <Text style={styles.actionButtonText}>📱 Acerca de SpotMyTrash</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={handleDeleteAccount}
        >
          <Text style={styles.dangerButtonText}>⚠️ Eliminar Cuenta</Text>
        </TouchableOpacity>
      </View>

      {/* Footer con información adicional */}
      <View style={styles.footerSection}>
        <Text style={styles.footerText}>SpotMyTrash v1.0.0</Text>
        <Text style={styles.footerText}>Construyendo ciudades más limpias, juntos 🌱</Text>
        <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄 Actualizar estadísticas</Text>
        </TouchableOpacity>
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
    backgroundColor: '#f8f9fa',
  },

  // Estado de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },

  // Sección de usuario mejorada
  userSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0fff0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#00ffcc',
    position: 'relative',
  },
  avatarText: {
    fontSize: 40,
  },
  levelBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#00ffcc',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 16,
    color: '#00ffcc',
    fontWeight: '600',
    marginBottom: 12,
  },
  impactBadgeContainer: {
    marginBottom: 16,
  },
  impactBadge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ffcc',
    backgroundColor: '#f0fff0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffcc',
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffcc',
    borderRadius: 4,
  },

  // Secciones generales
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },

  // Estadísticas mejoradas
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
    fontSize: 40,
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Logros
  achievementsContainer: {
    marginTop: 8,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  achievementsList: {
    gap: 12,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00ffcc',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  achievementDesc: {
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
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Footer
  footerSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  refreshButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0fff0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00ffcc',
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#00ffcc',
    fontWeight: '500',
  },

  // Espaciado inferior
  bottomSpacing: {
    height: 32,
  },
});