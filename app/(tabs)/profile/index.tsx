import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Image,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UserAvatarData {
  url_secura: string;
  id_image: string;
}

interface UserAvatar {
  _id: string;
  gender: string;
  avatars: UserAvatarData;
  __v: number;
}

type User = {
  name: string;
  email: string;
  userName: string;
  nivel: string; // <-- Campo que contiene la etapa de edad (ej: "Joven Adulto")
  avatar: UserAvatar;
};

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
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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

  return (
    <SafeAreaView className="flex-1 bg-white">
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
                  source={{ uri: user.avatar.avatars.url_secura }}
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
        <Text className="text-base font-bold color-tertiary mb-4">GENERAL</Text>

        {/* Profile Settings Item */}
        <View className="mb-5">
          <Text className="text-lg font-normal text-[#f29200]">
            Profile Settings
          </Text>
          <Text className="text-sm text-gray-600">
            Update and modify your profile
          </Text>
        </View>

        {/* Notifications Option */}
        <View className="flex-row justify-between items-center py-4 border-b border-gray-200">
          <View className="flex-1">
            <Text className="text-base text-[#f29200]">Notifications</Text>
            <Text className="text-sm text-gray-600">
              Change your notification settings
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>

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
    </SafeAreaView>
  );
};

export default ProfileScreen;
