// components/SystemUIController.tsx
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Importaciones condicionales
let NavigationBar: any = null;
let SystemUI: any = null;

if (Platform.OS === 'android') {
  try {
    NavigationBar = require('expo-navigation-bar');
    SystemUI = require('expo-system-ui');
  } catch (error) {
    console.log('📱 Navigation bar modules not available');
  }
}

function SystemUIController() {
  useEffect(() => {
    const setupSystemUI = async () => {
      if (Platform.OS === 'android' && NavigationBar && SystemUI) {
        try {
          console.log('🔧 Configurando UI del sistema...');
          
          // Ocultar la barra de navegación
          await NavigationBar.setVisibilityAsync('hidden');
          
          // Solo configurar behavior si no está en modo edge-to-edge
          try {
            await NavigationBar.setBehaviorAsync('inset-swipe');
          } catch (behaviorError) {
            console.log('ℹ️ Behavior no compatible con configuración actual');
          }
          
          // Configurar color de barra de estado
          try {
            await SystemUI.setBackgroundColorAsync('#00ffcc');
          } catch (colorError) {
            console.log('ℹ️ Color de barra de estado manejado por configuración');
          }
          
          console.log('✅ Controles del sistema configurados');
          
        } catch (error) {
          console.log('⚠️ Algunos aspectos de UI del sistema no se pudieron configurar:', error.message);
        }
      } else if (Platform.OS === 'android') {
        console.log('📱 Usando configuración de app.config.js para controles del sistema');
      }
    };

    setupSystemUI();
    
    return () => {
      if (Platform.OS === 'android' && NavigationBar) {
        NavigationBar.setVisibilityAsync('visible').catch(() => {});
      }
    };
  }, []);

  return null;
}

export default SystemUIController;