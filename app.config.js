// app.config.js
import 'dotenv/config'; // Importa esto al inicio

export default {
  expo: {
    name: "SpotMyTrash",
    slug: "spotmytrash",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    extra: {
      // Ahora lee desde el .env
      mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN
    },
    // ... resto de tu configuración
  }
};