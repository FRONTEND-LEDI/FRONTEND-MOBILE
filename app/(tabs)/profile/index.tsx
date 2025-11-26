import { getMedals, MedalResponse } from "@/app/api/profile";
import { getBookbyLatestProgress } from "@/app/api/recomendations";
import { UserType } from "@/app/context/authContext";
import { calculatePointsToNextLevel, calculateProgressPercentage, getLevelFrameColor, getLevelName, getProgressMessage } from "@/app/helpers/levelHelper";
import BookCarousel from "@/components/BookCarousel";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [progress, setProgress] = useState<any[]>([]);
  const [userMedals, setUserMedals] = useState<MedalResponse[]>([]);
  useEffect(() => {
    const fetchUser = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        setLoading(false);
        return;
      }
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
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await getBookbyLatestProgress();
        setProgress(response);
      } catch (error) {
        console.error("Error fetching progress:", error);
        setProgress([]);
      }
    };
    fetchProgress();
  }, []);
  useEffect(() => {
    const fetchUserMedals = async () => {
      if (user?.medals && Array.isArray(user.medals) && user.medals.length > 0) {
        try {
          const promises = user.medals.map((medalId: string) => getMedals(medalId));

          const medalsData = await Promise.all(promises);

          setUserMedals(medalsData);
        } catch (error) {
          console.error("Error fetching medals:", error);
        }
      }
    };

    fetchUserMedals();
  }, [user]); // Se ejecuta cuando se carga la información del usuario

  // ⭐ Calcular datos del nivel
  const pointsToNext = user ? calculatePointsToNextLevel(user) : 0;
  const progressPercent = user ? calculateProgressPercentage(user) : 0;
  const levelName = user ? getLevelName(typeof user.level === "string" ? 1 : user.level?.level) : "Inicial";
  const levelColor = user ? getLevelFrameColor(typeof user.level === "string" ? 1 : user.level?.level) : "#9CA3AF";
  const progressMessage = user ? getProgressMessage(progressPercent) : "";

  // Extraer avatar URL
  const getAvatarUrl = (): string => {
    if (!user?.avatar) return "https://via.placeholder.com/100";
    if (typeof user.avatar === "string") return user.avatar;
    if (typeof user.avatar === "object" && user.avatar.avatars?.url_secura) {
      return user.avatar.avatars.url_secura;
    }
    return "https://via.placeholder.com/100";
  };

  // Extraer URL del marco de nivel
  const getFrameUrl = (): string | undefined => {
    if (typeof user?.level === "string") return undefined;
    return user?.level?.img?.url_secura;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-base text-gray-600">Cargando datos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* HEADER */}
        <View className="pt-20 pb-[70px] px-5 rounded-b-3xl bg-[#D97706]"></View>

        {/* PROFILE CARD CONTAINER */}
        <View className="bg-white mx-10 -mt-16 rounded-xl shadow-lg shadow-black/20 p-5 items-center border-8 border-white">
          {/* PROFILE SECTION */}
          <View className="items-center py-[30px]">
            {user ? (
              <>
                {/* Profile Picture with Level Frame */}
                {getFrameUrl() ? (
                  // Con marco de nivel
                  <View className="w-[120px] h-[120px] relative mb-2 -mt-[100px] justify-center items-center">
                    {/* Avatar base */}
                    <View className="w-[100px] h-[100px] rounded-full bg-[#f8d49a] justify-center items-center overflow-hidden">
                      <Image className="w-full h-full rounded-full" source={{ uri: getAvatarUrl() }} />
                    </View>

                    {/* Marco de nivel superpuesto */}
                    <Image className="absolute w-[120px] h-[120px]" source={{ uri: getFrameUrl() }} resizeMode="contain" />

                    {/* Badge del nivel */}
                    <View
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full justify-center items-center border-4 border-white"
                      style={{ backgroundColor: levelColor }}
                    >
                      <Text className="text-lg font-bold text-white">{typeof user.level === "string" ? 1 : user.level?.level || 1}</Text>
                    </View>
                  </View>
                ) : (
                  // Sin marco: Border con color
                  <View
                    className="w-[100px] h-[100px] rounded-full bg-[#f8d49a] justify-center items-center mb-2 -mt-[100px] border-4"
                    style={{ borderColor: levelColor }}
                  >
                    <Image className="w-full h-full rounded-full" source={{ uri: getAvatarUrl() }} />
                    {/* Badge del nivel */}
                    <View
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full justify-center items-center border-4 border-white"
                      style={{ backgroundColor: levelColor }}
                    >
                      <Text className="text-lg font-bold text-white">{typeof user.level === "string" ? 1 : user.level?.level || 1}</Text>
                    </View>
                  </View>
                )}

                {/* Name Container */}
                <View className="flex-row items-center mb-1">
                  <Text className="text-xl font-bold mb-1 text-[#f29200]">
                    {user.name} {user.lastName}
                  </Text>
                  <MaterialIcons name="verified" size={18} color="#4a90e2" />
                </View>
                <Text className="text-base text-gray-600 mb-3">{user.email}</Text>

                {/* Nivel Badge */}
                <View
                  className="flex-row items-center mt-3 px-3 py-2 rounded-full border-2"
                  style={{ borderColor: levelColor, backgroundColor: levelColor + "20" }}
                >
                  <MaterialIcons name="emoji-events" size={16} color={levelColor} />
                  <Text className="ml-2 text-sm font-semibold" style={{ color: levelColor }}>
                    {levelName}
                  </Text>
                </View>
              </>
            ) : (
              <Text className="text-base text-gray-600">Cargando datos...</Text>
            )}
          </View>
        </View>

        {/* PUNTOS Y PROGRESO SECTION */}
        {user && (
          <View className="px-5 py-6">
            {/* Puntos Card */}
            <View className="bg-gray-50 py-4 px-4 rounded-lg mb-4 border border-gray-200">
              <Text className="text-xs text-gray-600 mb-2 font-medium">Puntos Totales</Text>
              <Text className="text-3xl font-bold text-primary">{user.point || 0}</Text>
            </View>

            {/* Medallas Section */}
            {userMedals && userMedals.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm text-gray-600 font-medium mb-3">Medallas</Text>
                <View className="flex-row flex-wrap gap-3 justify-start">
                  {userMedals.map((medal) => {
                    const medalImageUrl = medal?.medal?.img?.url_secura;
                    return (
                      <View key={medal.medal._id} className="items-center">
                        {medalImageUrl ? (
                          <View className="w-20 h-20 bg-gray-100 rounded-lg justify-center items-center">
                            <Image
                              source={{ uri: medalImageUrl }}
                              style={{ width: 80, height: 80 }}
                              resizeMode="contain"
                              onError={() => console.log("Error cargando medalla:", medalImageUrl)}
                            />
                          </View>
                        ) : (
                          <View className="w-20 h-20 bg-gray-200 rounded-lg justify-center items-center">
                            <Text className="text-xs text-gray-500">Sin imagen</Text>
                          </View>
                        )}
                        <Text className="text-xs text-gray-600 mt-2 text-center w-20">{medal.medal.name}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Progreso Card */}
            <View className="bg-gray-50 py-4 px-4 rounded-lg mb-4 border border-gray-200">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm text-gray-600 font-medium">Progreso al siguiente nivel</Text>
                <Text className="text-base font-bold text-primary">{Math.round(progressPercent)}%</Text>
              </View>

              {/* Progress Bar */}
              <View className="h-3 bg-gray-300 rounded-full overflow-hidden mb-3">
                <View className="h-full rounded-full" style={{ width: `${Math.max(5, progressPercent)}%`, backgroundColor: levelColor }} />
              </View>

              {/* Info Text */}
              <Text className="text-xs text-gray-600 mb-2">
                {user.point || 0} / {typeof user.level === "string" ? 100 : user.level?.maxPoint || 500} puntos
              </Text>

              {/* Points to Next */}
              <Text className="text-sm text-primary font-medium mb-2">
                {pointsToNext > 0 ? `${pointsToNext} puntos para siguiente nivel` : "¡Ya estás en el máximo de este nivel!"}
              </Text>

              {/* Motivational Message */}
              <Text className="text-sm text-primary font-medium italic">{progressMessage}</Text>
            </View>

            {/* Niveles Info Card */}
            <View className="mb-6 bg-yellow-50 px-4 py-3 rounded-lg border-l-4" style={{ borderLeftColor: colors.primary }}>
              <Text className="text-sm text-gray-900 font-semibold">{levelName}</Text>
              <Text className="text-xs text-gray-600 mt-2">
                Máximo de este nivel: {typeof user.level === "string" ? 100 : user.level?.maxPoint || 500} puntos
              </Text>
            </View>
          </View>
        )}

        {/* SETTINGS SECTION */}
        <View className="p-5">
          {/* Reading Section */}
          {progress.filter((item) => item.status === "reading").length > 0 && (
            <View className="mb-5">
              <View className="mb-4">
                <Text className="text-2xl text-primary font-bold tracking-tight">En Proceso</Text>
                <View className="mt-1 w-12 h-1 bg-primary rounded-full" />
              </View>
              <BookCarousel data={progress.filter((item) => item.status === "reading")} onPressItem={(item) => router.push(`/catalogue/${item._id}`)} />
            </View>
          )}

          {/* Finished Section */}
          {progress.filter((item) => item.status === "finished").length > 0 && (
            <View className="mb-5">
              <View className="mb-4">
                <Text className="text-2xl text-primary font-bold tracking-tight">Finalizado</Text>
                <View className="mt-1 w-12 h-1 bg-primary rounded-full" />
              </View>
              <BookCarousel data={progress.filter((item) => item.status === "finished")} onPressItem={(item) => router.push(`/catalogue/${item._id}`)} />
            </View>
          )}

          {/* Pending Section */}
          {progress.filter((item) => item.status === "pending").length > 0 && (
            <View className="mb-5">
              <View className="mb-4">
                <Text className="text-2xl text-primary font-bold tracking-tight">Pendiente</Text>
                <View className="mt-1 w-12 h-1 bg-primary rounded-full" />
              </View>
              <BookCarousel data={progress.filter((item) => item.status === "pending")} onPressItem={(item) => router.push(`/catalogue/${item._id}`)} />
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
              <Text className="text-base text-[#ff3b30] font-bold ml-2">Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StatusBar backgroundColor={colors.primary} animated />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
