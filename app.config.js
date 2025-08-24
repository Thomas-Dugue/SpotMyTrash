export default {
  expo: {
    name: "SpotMyTrash",
    slug: "SpotMyTrash", 
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "spotmytrash",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      // 🔥 CAMBIO CRÍTICO: Desactivar edgeToEdgeEnabled para evitar conflictos
      edgeToEdgeEnabled: false,
      package: "com.anonymous.SpotMyTrash",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ],
      // ✅ Ahora estas configuraciones funcionarán correctamente
      navigationBar: {
        visible: false,
        behavior: "inset-swipe"
      },
      statusBar: {
        hidden: false,
        style: "dark",
        translucent: false,
        backgroundColor: "#00ffcc"
      }
    },
    web: {
      bundler: "metro",
      output: "static", 
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-camera", 
      "expo-location",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  }
};