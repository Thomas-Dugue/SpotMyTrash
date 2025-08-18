// Camera.tsx corregido y funcionando con creación de garbagePoints
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as Location from "expo-location";
import * as Network from "expo-network";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../lib/firebase";

type GPS = { latitude: number; longitude: number; accuracy?: number | undefined } | null;

export default function CameraScreen() {
  const [type, setType] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [gps, setGps] = useState<GPS>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: "center", marginBottom: 10 }}>
          Necesitamos permiso para usar la cámara.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCamera = () => setType(type === "back" ? "front" : "back");

  const getLocation = async (): Promise<GPS> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy ?? undefined,
    };
  };

  const saveLocal = async (uri: string, meta: object) => {
    const dir = `${FileSystem.documentDirectory}photos/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const filename = `${Date.now()}.jpg`;
    const dest = `${dir}${filename}`;
    await FileSystem.moveAsync({ from: uri, to: dest });

    const metaPath = `${dest}.json`;
    await FileSystem.writeAsStringAsync(metaPath, JSON.stringify(meta), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return dest;
  };

  const uploadPhotoAndGetId = async (uri: string, meta: any): Promise<string> => {
    console.log("\uD83D\uDE80 Iniciando subida a Firebase Storage...");
    const res = await fetch(uri);
    const blob = await res.blob();
    console.log("\uD83D\uDCE6 Blob generado:", blob.size, "bytes");

    const filename = `${Date.now()}.jpg`;
    const storageRef = ref(storage, `photos/${filename}`);
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    console.log("\uD83D\uDCCE URL de descarga:", downloadURL);

    const photoDoc = await addDoc(collection(db, "photos"), {
      url: downloadURL,
      storagePath: `photos/${filename}`,
      createdAt: serverTimestamp(),
      device: meta.device ?? "android",
      gps: meta.gps,
    });

    console.log("✅ Documento de foto creado con ID:", photoDoc.id);
    return photoDoc.id;
  };

  const createGarbagePoint = async (gps: GPS, photoId: string) => {
    try {
      console.log("\uD83D\uDEE0 createGarbagePoint() ejecutado con:", gps, photoId);
      const docRef = await addDoc(collection(db, "garbagePoints"), {
        gps: {
          latitude: gps?.latitude,
          longitude: gps?.longitude,
          ...(gps?.accuracy !== undefined && gps?.accuracy !== null && { accuracy: gps.accuracy }),
        },
        photoId,
        createdAt: serverTimestamp(),
      });
      console.log("\uD83D\uDCCD Punto de basura creado:", docRef.id);
    } catch (error) {
      console.error("❌ Error al crear garbagePoint:", JSON.stringify(error));
    }
  };

  const uploadToFirebase = async (uri: string, meta: any) => {
    console.log("\uD83D\uDE80 uploadToFirebase() INICIADO");
    console.log("\uD83D\uDCE6 URI:", uri);
    console.log("\uD83E\uDEC1 Meta:", JSON.stringify(meta));

    try {
      if (!meta || !meta.gps) {
        console.warn("⚠️ meta o meta.gps es null o undefined.");
        return;
      }

      const photoId = await uploadPhotoAndGetId(uri, meta);
      if (!photoId) {
        console.warn("⚠️ photoId está vacío. Abortando.");
        return;
      }

      console.log("\uD83D\uDCCD Llamando a createGarbagePoint con GPS:", meta.gps);
      await createGarbagePoint(meta.gps, photoId);
      console.log("✅ garbagePoint creado correctamente");
    } catch (e) {
      console.error("❌ Error en uploadToFirebase:", e);
      throw e;
    }
  };

  const takePicture = async () => {
    try {
      if (!cameraRef.current) return;
      const shot = await cameraRef.current.takePictureAsync();
      const currentGps = await getLocation();
      setPhotoUri(shot.uri);
      setGps(currentGps);
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message ?? "No se pudo tomar la foto");
    }
  };

  const retake = () => {
    setPhotoUri(null);
    setGps(null);
  };

  const confirmAndSave = async () => {
    if (!photoUri) return;
    try {
      setSubmitting(true);
      const net = await Network.getNetworkStateAsync();
      const online = !!net.isConnected && !!net.isInternetReachable;

      const meta = { gps, device: "android" };

      if (online) {
        await uploadToFirebase(photoUri, meta);
        Alert.alert("Foto registrada", "Subida a Firebase con GPS.");
      } else {
        const dest = await saveLocal(photoUri, meta);
        Alert.alert(
          "Sin conexión",
          `Guardada localmente para sincronizar luego:\n${dest}`
        );
      }

      router.back();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message ?? "No se pudo registrar la foto");
    } finally {
      setSubmitting(false);
    }
  };

  if (!photoUri) {
    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={type} />
        <View style={styles.controls}>
          <TouchableOpacity onPress={toggleCamera} style={styles.button}>
            <Text style={styles.text}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={takePicture} style={styles.button}>
            <Text style={styles.text}>📸</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.previewContainer}>
      <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Datos GPS detectados</Text>
        <Text style={styles.mono}>
          {gps
            ? `lat: ${gps.latitude.toFixed(6)}\nlon: ${gps.longitude.toFixed(6)}\naccuracy: ${gps.accuracy ?? "-"} m`
            : "Sin permisos o no disponible"}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={retake} style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Reintentar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={confirmAndSave} style={styles.primaryBtn} disabled={submitting}>
          <Text style={styles.primaryText}>
            {submitting ? "Guardando..." : "Validar y registrar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderRadius: 10,
  },
  text: { color: "#fff", fontSize: 18 },
  previewContainer: { flex: 1, backgroundColor: "#000" },
  preview: { width: "100%", height: "60%" },
  infoBox: {
    padding: 12,
    margin: 12,
    backgroundColor: "#111",
    borderRadius: 10,
  },
  infoTitle: { color: "#fff", fontWeight: "600", marginBottom: 6 },
  mono: { color: "#d7d7d7", fontFamily: "monospace" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555",
  },
  secondaryText: { color: "#ddd" },
  primaryBtn: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#2e7d32",
  },
  primaryText: { color: "#fff", fontWeight: "600" },
});
// Camera.tsx corregido y funcionando con creación de garbagePoints
// Si quieres permitir null y undefined: