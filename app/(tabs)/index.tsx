import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Botón para ir a la cámara */}
      <Button title="📸 Tomar Foto" onPress={() => router.push("../Camera")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

