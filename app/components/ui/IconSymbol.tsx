// app/components/ui/IconSymbol.tsx - Sistema de íconos completo para SpotMyTrash
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Mapeo completo de SF Symbols a Material Icons para SpotMyTrash
 * Organizado por categorías para fácil mantenimiento
 */
const MAPPING = {
  // 🧭 NAVEGACIÓN PRINCIPAL
  'map.fill': 'map',
  'list.bullet.rectangle': 'assignment',
  'person.circle.fill': 'account-circle',
  'info.circle.fill': 'info',
  'house.fill': 'home',

  // 📷 CÁMARA Y CAPTURA
  'camera.fill': 'camera-alt',
  'photo.fill': 'photo',
  'plus.circle.fill': 'add-circle',

  // 📍 UBICACIÓN Y GPS
  'location.fill': 'location-on',
  'location.circle.fill': 'my-location',
  'map': 'map',

  // 🗑️ BASURA Y REPORTES  
  'trash.fill': 'delete',
  'exclamationmark.triangle.fill': 'warning',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',

  // 👤 USUARIO Y PERFIL
  'person.fill': 'person',
  'person.circle': 'account-circle',
  'gear': 'settings',
  'star.fill': 'star',
  'star': 'star-border',

  // 📊 ESTADÍSTICAS Y DATOS
  'chart.bar.fill': 'bar-chart',
  'chart.pie.fill': 'pie-chart',
  'trophy.fill': 'emoji-events',

  // 🔄 ACCIONES Y ESTADOS
  'arrow.clockwise': 'refresh',
  'square.and.arrow.up': 'share',
  'square.and.arrow.down': 'download',
  'paperplane.fill': 'send',

  // ⚙️ CONFIGURACIÓN Y UTILIDADES
  'slider.horizontal.3': 'tune',
  'bell.fill': 'notifications',
  'bell': 'notifications-none',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',

  // 🎯 FILTROS Y ORDENAMIENTO
  'line.horizontal.3.decrease': 'filter-list',
  'magnifyingglass': 'search',
  'calendar': 'calendar-today',

  // 🌐 CONECTIVIDAD
  'wifi': 'wifi',
  'wifi.slash': 'wifi-off',
  'cloud.fill': 'cloud',
  'cloud.slash.fill': 'cloud-off',

  // ⚡ ESTADO DE LA APP
  'exclamationmark.circle.fill': 'error',
  'questionmark.circle.fill': 'help',
  'lightbulb.fill': 'lightbulb',

  // 📱 INTERFAZ
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.up': 'expand-less',
  'chevron.down': 'expand-more',
  'plus': 'add',
  'minus': 'remove',

  // 📄 DOCUMENTOS Y EXPORT
  'doc.fill': 'description',
  'doc.plaintext.fill': 'text-snippet',
  'square.and.arrow.up.fill': 'file-upload',

  // 🏆 GAMIFICACIÓN (para futuras features)
  'medal.fill': 'military-tech',
  'crown.fill': 'workspace-premium',
  'flame.fill': 'local-fire-department',

  // ⚠️ LEGACY - Para compatibilidad
  'chevron.left.forwardslash.chevron.right': 'code',
} as IconMapping;

/**
 * Componente de íconos universal para SpotMyTrash
 * 
 * Características:
 * - Usa SF Symbols en iOS (cuando esté disponible)
 * - Fallback automático a Material Icons en Android/Web
 * - Soporte completo para todos los íconos necesarios en la app
 * - Tipos TypeScript estrictos para prevenir errores
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Verificar que el ícono existe en el mapeo
  if (!MAPPING[name]) {
    console.warn(`⚠️ Ícono "${name}" no encontrado en MAPPING. Usando ícono por defecto.`);
    return <MaterialIcons color={color} size={size} name="help" style={style} />;
  }

  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}

// Exportar el tipo para uso en otros componentes
export type { IconSymbolName };