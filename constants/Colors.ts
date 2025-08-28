/**
 * SpotMyTrash - Paleta de Colores Tech Verde Suave
 * Colores optimizados para la app de reporte de basura urbana
 * Paleta principal: Aquamarine (#7FFFD4) más elegante que el cyan original
 */

// 🎨 COLORES PRINCIPALES TECH VERDE SUAVE
const primaryColor = '#7FFFD4';      // Aquamarine - Color principal elegante
const secondaryColor = '#20B2AA';    // Light Sea Green - Secundario profundo  
const accentColor = '#5DADE2';       // Sky Blue - Acento armonioso
const neutralDark = '#2C3E50';       // Dark Blue Grey - Elegante para textos
const neutralLight = '#F0FDFA';      // Aqua tint - Fondo pristine

// 🚨 COLORES DE ESTADO Y NOTIFICACIONES
const successColor = '#4CAF50';      // Verde - Reportes verificados, basura limpiada
const warningColor = '#FF9800';      // Naranja - Reportes pendientes
const errorColor = '#F44336';        // Rojo - Errores, fallos de conexión
const infoColor = '#2196F3';         // Azul - Tips, información adicional

// Colores de tinte para light/dark mode (manteniendo tu estructura)
const tintColorLight = primaryColor;  // #7FFFD4 - Reemplaza tu azul genérico
const tintColorDark = primaryColor;   // #7FFFD4 - Mantiene consistencia

export const Colors = {
  // 🌅 MODO CLARO - Optimizado para SpotMyTrash
  light: {
    // Colores base (manteniendo tu estructura original)
    text: neutralDark,                 // #2C3E50 - Más elegante que negro
    background: '#FAFAFA',             // Fondo principal suave
    tint: tintColorLight,              // #7FFFD4 - Tu nuevo color principal
    icon: neutralDark,                 // #2C3E50 - Iconos elegantes
    tabIconDefault: '#8E8E93',         // Gris para tabs inactivas
    tabIconSelected: tintColorLight,   // #7FFFD4 - Tab activa
    
    // 🎯 COLORES ESPECÍFICOS SPOTMYTRASH
    primary: primaryColor,             // #7FFFD4 - Principal
    secondary: secondaryColor,         // #20B2AA - Secundario  
    accent: accentColor,               // #5DADE2 - Acento
    surface: '#FFFFFF',                // Cards, contenedores
    onSurface: neutralDark,            // Texto sobre superficies
    onPrimary: '#000000',              // Texto sobre color principal
    onSecondary: '#FFFFFF',            // Texto sobre secundario
    
    // 📱 ELEMENTOS DE UI
    headerBackground: primaryColor,     // Header con aquamarine
    headerText: '#000000',             // Texto negro sobre header
    buttonPrimary: primaryColor,       // Botones principales
    buttonSecondary: secondaryColor,   // Botones secundarios
    reportButtonCamera: accentColor,   // Botón especial de cámara
    
    // 🗑️ ESTADOS DE REPORTES
    reportPending: warningColor,       // Naranja - Pendiente
    reportVerified: successColor,      // Verde - Verificado ✅
    reportCleaned: secondaryColor,     // Sea Green - Limpiado 🧹
    reportNew: accentColor,            // Sky Blue - Nuevo (animación)
    
    // 🚨 NOTIFICACIONES Y ESTADOS
    success: successColor,             // Acciones exitosas
    warning: warningColor,             // Advertencias
    error: errorColor,                 // Errores
    info: infoColor,                   // Información
    
    // 🎨 FONDOS Y SUPERFICIES
    backgroundSecondary: neutralLight, // #F0FDFA - Fondo alternativo
    divider: '#E5E5E5',               // Separadores sutiles
    border: '#E0E0E0',                // Bordes de elementos
    placeholder: '#9E9E9E',           // Texto placeholder
  },

  // 🌙 MODO OSCURO - Coherente con la paleta
  dark: {
    // Colores base (manteniendo tu estructura)
    text: '#ECEDEE',                   // Texto claro (tu color original)
    background: '#151718',             // Fondo oscuro (tu color original)
    tint: tintColorDark,               // #7FFFD4 - Mantiene aquamarine
    icon: '#9BA1A6',                   // Iconos claros (tu color original)
    tabIconDefault: '#9BA1A6',         // Tabs inactivas (tu color original)
    tabIconSelected: tintColorDark,    // #7FFFD4 - Tab activa
    
    // 🎯 COLORES ESPECÍFICOS SPOTMYTRASH - MODO OSCURO
    primary: primaryColor,             // #7FFFD4 - Mantiene principal
    secondary: secondaryColor,         // #20B2AA - Mantiene secundario
    accent: accentColor,               // #5DADE2 - Mantiene acento
    surface: '#1F2937',                // Cards oscuros
    onSurface: '#F9FAFB',             // Texto sobre superficies oscuras
    onPrimary: '#000000',              // Negro sobre aquamarine (buen contraste)
    onSecondary: '#FFFFFF',            // Blanco sobre sea green
    
    // 📱 ELEMENTOS DE UI - MODO OSCURO
    headerBackground: primaryColor,     // Header mantiene aquamarine
    headerText: '#000000',             // Texto negro (contrasta bien)
    buttonPrimary: primaryColor,       // Botón principal
    buttonSecondary: secondaryColor,   // Botón secundario
    reportButtonCamera: accentColor,   // Botón cámara
    
    // 🗑️ ESTADOS DE REPORTES - MODO OSCURO
    reportPending: warningColor,       // Mantiene naranja
    reportVerified: successColor,      // Mantiene verde
    reportCleaned: secondaryColor,     // Sea green
    reportNew: accentColor,            // Sky blue
    
    // 🚨 NOTIFICACIONES - MODO OSCURO
    success: successColor,             // Estados mantienen colores
    warning: warningColor,
    error: errorColor,
    info: infoColor,
    
    // 🎨 FONDOS Y SUPERFICIES - MODO OSCURO  
    backgroundSecondary: '#0F172A',    // Fondo alternativo oscuro
    divider: '#374151',               // Separadores oscuros
    border: '#4B5563',                // Bordes oscuros
    placeholder: '#6B7280',           // Placeholder oscuro
  },
};

// 🎨 GRADIENTES TECH VERDE SUAVE (Bonus)
export const Gradients = {
  primary: [primaryColor, secondaryColor],        // Aquamarine → Sea Green
  accent: [accentColor, secondaryColor],         // Sky Blue → Sea Green  
  background: [neutralLight, '#FAFAFA'],         // Fondo suave
  header: [primaryColor, accentColor],           // Header dinámico
};

// 📏 SOMBRAS OPTIMIZADAS
export const Shadows = {
  small: {
    shadowColor: neutralDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: neutralDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: neutralDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// 🛠️ UTILIDADES HELPER
export const ColorUtils = {
  // Añadir opacidad a cualquier color
  withOpacity: (color: string, opacity: number): string => {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${color}${alpha}`;
  },
  
  // Obtener color de texto apropiado para un fondo
  getTextColor: (backgroundColor: string): string => {
    const darkBackgrounds = [secondaryColor, neutralDark];
    return darkBackgrounds.includes(backgroundColor) ? '#FFFFFF' : neutralDark;
  },
};

// 📊 COMPARACIÓN CON COLORES ANTERIORES (Para referencia)
export const Migration = {
  // Tus colores originales → Nuevos colores
  oldTint: '#0a7ea4',          // → #7FFFD4 (mucho más elegante)
  oldIcon: '#687076',          // → #2C3E50 (más moderno)  
  oldTabDefault: '#687076',    // → #8E8E93 (mejor contraste)
  
  // Guía de migración rápida:
  // Donde tenías Colors.light.tint → ahora Colors.light.primary
  // Donde tenías Colors.light.icon → ahora Colors.light.icon (mejorado)
  // Nuevos: Colors.light.secondary, Colors.light.accent, etc.
};

export default Colors;