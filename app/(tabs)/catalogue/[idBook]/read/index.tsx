import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function ReadBook() {
  const { pdfUrl} = useLocalSearchParams();

  if (!pdfUrl) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", fontSize: 16 }}>
          No se encontró la URL del PDF
        </Text>
      </View>
    );
  }

  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    pdfUrl as string
  )}&embedded=true`;
 //const uri = "http://10.254.197.191:5173"
  return (
    <SafeAreaView className="flex-1 bg-white">
      
      <WebView
        source={{ uri: googleDocsUrl }}
        style={{ flex: 1, 
          width: "100%",
         }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF6B00" />
          </View>
        )}
      />
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
