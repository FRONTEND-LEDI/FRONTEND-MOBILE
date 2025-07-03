import { authContext } from "@/app/context/authContext";
import BookCarousel from "@/components/BookCarousel";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useContext, useEffect } from "react";
import { Button, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const { logout, isLogin } = useContext(authContext);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token || !isLogin) {
        router.replace("/(auth)/signin");
      }
    };
    verificarSesion();
  }, [isLogin, router]);

  return (
    <View className="flex-1 bg-white">
      <Header />
      <BookCarousel />
      <View className="p-4">
        <Button title="Cerrar sesión" onPress={logout} />
      </View>
    </View>
  );
}
