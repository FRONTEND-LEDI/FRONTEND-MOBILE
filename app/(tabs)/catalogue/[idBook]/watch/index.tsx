import { getBookProgressById, postSaveProgress } from "@/app/api/bookProgress";
import { useEventListener } from "expo";
import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VideoScreen() {
  const [progress, setProgress] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const { mediaSource, idBook } = useLocalSearchParams();
  const id = Array.isArray(idBook) ? idBook[0] : idBook;
  const videoSource = Array.isArray(mediaSource) ? mediaSource[0] : mediaSource;

  // para asegurarnos de que el seek inicial solo ocurra una vez
  const hasSeekedRef = useRef(false);
  const isSeekingRef = useRef(false);
  const lastSavedTimeRef = useRef(0);

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    // No reproducir automáticamente hasta que hayamos hecho el seek
    player.pause();
    
    // necesario para que se dispare el evento timeUpdate
    player.timeUpdateEventInterval = 1;
  });

  // escuchar el evento timeUpdate para actualizar currentTime
  useEventListener(player, "timeUpdate", (payload: any) => {
    if (payload && typeof payload.currentTime === "number" && !isSeekingRef.current) {
      setCurrentTime(payload.currentTime);
    }
  });

  // escuchar cuando el vídeo está listo (usando statusChange en lugar de playing)
  useEventListener(player, "statusChange", (payload: any) => {
    if (payload && payload.status === "readyToPlay") {
      setIsPlayerReady(true);
    }
  });

  // escuchar cuando el vídeo termina
  useEventListener(player, "playToEnd", () => {
    handleSaveProgress(duration, duration, "finished");
  });

  // efecto para hacer el seek inicial cuando el player esté listo
  useEffect(() => {
    const fetchProgressAndSeek = async () => {
      if (!player || !isPlayerReady || hasSeekedRef.current) return;

      try {
        const resp = await getBookProgressById(id);
        if (resp && resp.position != null) {
          setProgress(resp);
          
          // Solo hacer seek si la posición es menor que la duración
          if (resp.position > 0 && resp.position < (player.duration || Infinity)) {
            isSeekingRef.current = true;
            hasSeekedRef.current = true;
            
            // Hacer el seek y luego reproducir
            player.currentTime = resp.position;
            lastSavedTimeRef.current = resp.position;
            
            // Pequeño delay para asegurar que el seek se complete
            setTimeout(() => {
              isSeekingRef.current = false;
              player.play();
            }, 100);
          } else {
            hasSeekedRef.current = true;
            player.play();
          }
        } else {
          // Si no hay progreso, simplemente reproducir
          hasSeekedRef.current = true;
          player.play();
        }
      } catch (err) {
        console.error("Error al obtener progreso:", err);
        // En caso de error, reproducir desde el inicio
        hasSeekedRef.current = true;
        player.play();
      }
    };

    fetchProgressAndSeek();
  }, [id, player, isPlayerReady]);

  // efecto para fijar duración cuando player esté listo
  useEffect(() => {
    if (player && typeof player.duration === "number" && player.duration > 0) {
      setDuration(player.duration);
    }
  }, [player, isPlayerReady]);

  // efecto para guardar progresivamente (cada 10 segundos o cuando haya un cambio significativo)
  useEffect(() => {
    // No guardar si el tiempo no ha cambiado significativamente
    if (Math.abs(currentTime - lastSavedTimeRef.current) < 5) {
      return;
    }

    const saveProgress = async () => {
      if (duration > 0 && currentTime >= 0 && !isSeekingRef.current) {
        await handleSaveProgress(currentTime, duration, "reading");
        lastSavedTimeRef.current = currentTime;
      }
    };

    // Guardar inmediatamente cuando hay un cambio significativo
    saveProgress();

    // También establecer un intervalo para guardar periódicamente
    const interval = setInterval(saveProgress, 10000);
    
    return () => clearInterval(interval);
  }, [currentTime, duration]);

  // efecto para guardar progreso cuando la app se cierre o se navegue away
  useEffect(() => {
    return () => {
      // Guardar progreso cuando el componente se desmonte
      if (currentTime > 0 && duration > 0) {
        handleSaveProgress(currentTime, duration, "reading");
      }
    };
  }, [currentTime, duration]);

  const handleSaveProgress = async (
    position: number,
    total: number,
    status: "reading" | "finished"
  ) => {
    // No guardar si estamos haciendo seek o si no tenemos datos válidos
    if (isSeekingRef.current || position < 0 || total <= 0) {
      return;
    }

    const percent = total > 0 ? Math.floor((position / total) * 100) : 0;
    const data = {
      idBook: id,
      position: Math.floor(position),
      total: Math.floor(total),
      percent,
      unit: "second",
      status,
    };
    
    try {
      await postSaveProgress(data);
      console.log("Progreso guardado:", data);
    } catch (err) {
      console.error("Error guardando progreso:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.videoWrapper}>
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const VIDEO_WIDTH = width - 40;
const VIDEO_HEIGHT = (VIDEO_WIDTH * 9) / 16;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  videoWrapper: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  handleContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  handle: {
    width: 64,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    alignSelf: "center",
  },
});