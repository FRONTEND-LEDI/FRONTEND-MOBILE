import { URI_VISOR } from "@/constants/ip";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function ReadBook() {
  const { idBook } = useLocalSearchParams();

  if (!idBook) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-base">
          No se encontró la URL del PDF
        </Text>
      </View>
    );
  }

  const uri = `http://${URI_VISOR}/book/read/${idBook}`;

return (
  <SafeAreaView className="flex-1 bg-white m-0">
    <WebView
      source={{ uri }}
      className="flex-1 w-full h-full m-0"
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
