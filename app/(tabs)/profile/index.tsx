import { getBookbyLatestProgress } from "@/app/api/recomendations";
import { UserType } from "@/app/context/authContext";
import BookCarousel from "@/components/BookCarousel";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Función para Mapear el Nivel a Estilos (Badge) ---
type NivelStyle = {
  className: string;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
};

const getNivelStyle = (nivel: string): NivelStyle => {
  const normalizedNivel = nivel.toLowerCase().trim();

  if (normalizedNivel.includes("joven adulto")) {
    return {
      className: "bg-green-100 text-green-800 border-blue-300",
      iconName: "person",
      label: "Joven Adulto",
    };
  }
  if (normalizedNivel.includes("adolescente")) {
    return {
      className: "bg-purple-100 text-purple-700 border-purple-300",
      iconName: "color-wand",
      label: "Adolescente",
    };
  }
  if (normalizedNivel.includes("adulto")) {
    return {
      className: "bg-green-100 text-green-700 border-green-300",
      iconName: "leaf",
      label: "Adulto ",
    };
  }
  // Valor por defecto
  return {
    className: "bg-gray-100 text-gray-700 border-gray-300",
    iconName: "ellipsis-horizontal-circle",
    label: "Nivel No Definido",
  };
};
// -----------------------------------------------------

const ProfileScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const router = useRouter();
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;
      try {
        const userReq = await fetch(`http://${IP_ADDRESS}:3402/oneUser`, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });
        const userRes = await userReq.json();
        setUser(userRes.result);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const nivelStyle = user ? getNivelStyle(user.nivel) : null;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await getBookbyLatestProgress()
        console.log(response)
        setProgress(response)
      } catch (error) {
        console.error("Error fetching progress:", error);
        setProgress([])
      }
    };
    fetchProgress();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>

        {/* HEADER */}
        <View className="pt-20 pb-[70px] px-5 rounded-b-3xl  bg-[#D97706]"></View>

        {/* PROFILE CARD CONTAINER */}
        <View className="bg-white mx-10 -mt-16 rounded-xl shadow-lg shadow-black/20 p-5 items-center border-8 border-white">
          {/* PROFILE SECTION */}
          <View className="items-center py-[30px]">
            {user ? (
              <>
                {/* Profile Picture */}
                <View className="w-[100px] h-[100px] rounded-full bg-[#f8d49a] justify-center items-center mb-2 -mt-[100px] border-8 border-white">
                  <Image
                    className="w-full h-full rounded-full"
                    source={{ uri: user.avatar }}
                  />
                </View>
                {/* Name Container */}
                <View className="flex-row items-center mb-1">
                  <Text className="text-xl font-bold mb-1 text-[#f29200]">
                    {user.name}
                  </Text>
                  <MaterialIcons name="verified" size={18} color="#4a90e2" />
                </View>
                <Text className="text-base text-gray-600">{user.email}</Text>

                {/* === BADGE DE NIVEL/EDAD (Añadido aquí) === */}
                {nivelStyle && (
                  <View
                    className={`flex-row items-center mt-3 px-3 py-1 rounded-full border ${nivelStyle.className}`}
                  >
                    <Text
                      className={`ml-2 text-sm font-semibold ${nivelStyle.className
                        .split(" ")
                        .find((cls) => cls.startsWith("text-"))}`}
                    >
                      {nivelStyle.label}
                    </Text>
                  </View>
                )}
                {/* ========================================= */}
              </>
            ) : (
              <Text className="text-base text-gray-600">Cargando datos...</Text>
            )}
          </View>
        </View>

        {/* SETTINGS SECTION */}
        <View className="p-5">


          {/* Profile Settings Item */}
          <View className="mb-5">
            <Text className="text-2xl font-bold text-primary">
              Configuración del perfil
            </Text>
            <Text className="text-md text-gray-600">
              Actualiza y modifica tu perfil
            </Text>
          </View>

          {/* Reading Section */}
          {progress.filter((item) => item.status === "reading").length > 0 && (
            <View className="mb-5">
              <View className=" mb-4">
                <Text className="text-2xl text-primary font-bold tracking-tight">En Proceso</Text>
                <View className="mt-1 w-12 h-1 bg-primary rounded-full" />
              </View>
              <BookCarousel
                data={progress.filter((item) => item.status === "reading")}
                onPressItem={(item) => router.push(`/catalogue/${item._id}`)}
              />
            </View>
          )}

          {/* Finished Section */}
          {progress.filter((item) => item.status === "finished").length > 0 && (
            <View className="mb-5">
              <View className="mb-4">
                <Text className="text-2xl text-primary font-bold tracking-tight">Finalizado</Text>
                <View className="mt-1 w-12 h-1 bg-primary rounded-full" />
              </View>
              <BookCarousel
                data={progress.filter((item) => item.status === "finished")}
                onPressItem={(item) => router.push(`/catalogue/${item._id}`)}
              />
            </View>
          )}

          {/* Pending Section */}
          {progress.filter((item) => item.status === "pending").length > 0 && (
            <View className="mb-5">
              <View className="mb-4">
                <Text className="text-2xl text-primary font-bold tracking-tight">Pendiente</Text>
                <View className="mt-1 w-12 h-1 bg-primary rounded-full" />
              </View>
              <BookCarousel
                data={progress.filter((item) => item.status === "pending")}
                onPressItem={(item) => router.push(`/catalogue/${item._id}`)}
              />
            </View>
          )}

          {/* Logout Button Container */}
          <View className="mt-8 items-center">
            <TouchableOpacity
              className="flex-row items-center bg-[#fff0ee] py-3 px-8 rounded-full border border-[#ff3b30]"
              onPress={async () => {
                await SecureStore.deleteItemAsync("token");
                router.replace("/(auth)/signin");
              }}
            >
              <MaterialIcons name="logout" size={24} color="#ff3b30" />
              <Text className="text-base text-[#ff3b30] font-bold ml-2">
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <StatusBar backgroundColor={colors.primary} animated />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
