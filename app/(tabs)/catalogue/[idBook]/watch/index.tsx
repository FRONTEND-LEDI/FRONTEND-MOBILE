import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { Dimensions, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VideoScreen() {
  const { mediaSource } = useLocalSearchParams();
  
  const videoSource = Array.isArray(mediaSource) ? mediaSource[0] : mediaSource;

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.play();
  });
  
  
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

        {/* Barra inferior decorativa */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const VIDEO_WIDTH = width - 40; // márgenes laterales
const VIDEO_HEIGHT = (VIDEO_WIDTH * 9) / 16; // relación 16:9

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
    backgroundColor: "#000", // fondo negro cuando carga
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3, // sombra en Android
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
