import { getMedals, MedalResponse } from "@/app/api/profile";
import { getBookbyLatestProgress } from "@/app/api/recomendations";
import { UserType } from "@/app/context/authContext";
import { calculatePointsToNextLevel, calculateProgressPercentage, getLevelFrameColor, getLevelName, getProgressMessage } from "@/app/helpers/levelHelper";
import BookCarousel from "@/components/BookCarousel";
import EditProfileModal from "@/components/profile/EditProfileModal";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Modal, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [progress, setProgress] = useState<any[]>([]);
  const [userMedals, setUserMedals] = useState<MedalResponse[]>([]);
  const [selectedMedal, setSelectedMedal] = useState<{ url: string, name: string } | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const fetchUserData = async () => {
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
      setRefreshing(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await getBookbyLatestProgress();
      // Validar que no existan IDs duplicados
      const uniqueResponse = response.filter((item: any, index: number, self: any[]) =>
        index === self.findIndex((t) => t._id === item._id)
      );
      setProgress(uniqueResponse);
    } catch (error) {
      console.error("Error fetching progress:", error);
      setProgress([]);
    }
  };

  const fetchUserMedals = async () => {
    if (user?.medals && Array.isArray(user.medals) && user.medals.length > 0) {
      try {
        // Eliminar IDs duplicados antes de hacer las peticiones
        const uniqueMedalIds = [...new Set(user.medals)];
        const promises = uniqueMedalIds.map((medalId: string) => getMedals(medalId));
        const medalsData = await Promise.all(promises);
        setUserMedals(medalsData);
      } catch (error) {
        console.error("Error fetching medals:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchProgress();
  }, []);

  useEffect(() => {
    fetchUserMedals();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
    fetchProgress();
  };

  // Calcular datos del nivel
  const pointsToNext = user ? calculatePointsToNextLevel(user) : 0;
  const progressPercent = user ? calculateProgressPercentage(user) : 0;
  const levelName = user ? getLevelName(typeof user.level === "string" ? 1 : user.level?.level) : "Inicial";
  const levelColor = user ? getLevelFrameColor(typeof user.level === "string" ? 1 : user.level?.level) : "#9CA3AF";
  const progressMessage = user ? getProgressMessage(progressPercent) : "";

  const getAvatarUrl = (): string => {
    if (!user?.avatar) return "https://via.placeholder.com/100";
    if (typeof user.avatar === "string") return user.avatar;
    if (typeof user.avatar === "object" && user.avatar.avatars?.url_secura) {
      return user.avatar.avatars.url_secura;
    }
    return "https://via.placeholder.com/100";
  };

  const getFrameUrl = (): string | undefined => {
    if (typeof user?.level === "string") return undefined;
    return user?.level?.img?.url_secura;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  // Calcular estadísticas de lectura
  const readingStats = {
    reading: progress.filter((item) => item.status === "reading").length,
    finished: progress.filter((item) => item.status === "finished").length,
    pending: progress.filter((item) => item.status === "pending").length,
    total: progress.length,
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-base text-gray-600 mt-4 font-medium">Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER CON GRADIENTE */}
        <LinearGradient
          colors={[colors.primary, '#ea580c', '#c2410c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-14 pb-24 px-5 rounded-b-[40px] shadow-lg"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-2xl font-bold tracking-tight">Mi Perfil</Text>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/20 justify-center items-center backdrop-blur-md"
              onPress={() => setIsEditModalVisible(true)}
            >
              <MaterialIcons name="edit" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* PROFILE CARD */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(600).springify()}
          className="mx-5 -mt-16 bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 mb-6"
        >
          {/* Avatar Area */}
          <View className="items-center -mt-16 mb-4">
            <View className="relative">
              <View className="w-[110px] h-[110px] rounded-full bg-white p-1 shadow-lg shadow-black/10">
                <Image
                  className="w-full h-full rounded-full"
                  source={{ uri: getAvatarUrl() }}
                />
              </View>

              {getFrameUrl() && (
                <Image
                  className="absolute -top-4 -left-4 w-[142px] h-[142px]"
                  source={{ uri: getFrameUrl() }}
                  resizeMode="contain"
                />
              )}

              <View
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full justify-center items-center border-[3px] border-white shadow-sm"
                style={{ backgroundColor: levelColor }}
              >
                <Text className="text-xs font-bold text-white">
                  {typeof user?.level === "string" ? 1 : user?.level?.level || 1}
                </Text>
              </View>
            </View>
          </View>

          {/* User Info */}
          <View className="items-center">
            <View className="flex-row items-center gap-1 mb-1">
              <Text className="text-2xl font-bold text-gray-900 text-center">
                {user?.name} {user?.lastName}
              </Text>
              {user?.rol === "admin" && (
                <MaterialIcons name="verified" size={20} color={colors.primary} />
              )}
            </View>

            <Text className="text-gray-500 font-medium mb-1">@{user?.userName}</Text>

            {user?.email && (
              <Text className="text-xs text-gray-400 mb-3">{user.email}</Text>
            )}

            <View className="flex-row items-center gap-2 mb-4">
              <View
                className="px-3 py-1 rounded-full flex-row items-center gap-1"
                style={{ backgroundColor: levelColor + '15' }}
              >
                <FontAwesome5 name="crown" size={12} color={levelColor} />
                <Text className="text-xs font-bold" style={{ color: levelColor }}>
                  {levelName}
                </Text>
              </View>


              <View className="px-3 py-1 rounded-full bg-gray-100 flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={12} color="#6b7280" />
                <Text className="text-xs font-medium text-gray-500">
                  {user?.nivel}
                </Text>
              </View>

            </View>
          </View>

          {/* Stats Grid */}
          {readingStats.total > 0 && (
            <View className="flex-row justify-between border-t border-gray-100 pt-5 mt-2">
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-gray-900">{readingStats.reading}</Text>
                <Text className="text-xs text-gray-500 mt-1">Leyendo</Text>
              </View>
              <View className="w-[1px] h-8 bg-gray-100" />
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-gray-900">{readingStats.finished}</Text>
                <Text className="text-xs text-gray-500 mt-1">Leídos</Text>
              </View>
              <View className="w-[1px] h-8 bg-gray-100" />
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-gray-900">{readingStats.pending}</Text>
                <Text className="text-xs text-gray-500 mt-1">Lista</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* LEVEL PROGRESS */}
        {user && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            className="mx-5 mb-6"
          >
            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-gray-200">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-yellow-50 justify-center items-center">
                    <FontAwesome5 name="star" size={18} color="#eab308" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-gray-900">Nivel {typeof user.level === "string" ? 1 : user.level?.level || 1}</Text>
                    <Text className="text-xs text-gray-500">{user.point || 0} Puntos totales</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-500 mb-1">Próximo nivel</Text>
                  <Text className="text-sm font-bold text-gray-900">
                    {typeof user.level === "string" ? 100 : user.level?.maxPoint || 500} pts
                  </Text>
                </View>
              </View>

              <View className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                <LinearGradient
                  colors={[levelColor, levelColor + 'dd']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${Math.max(5, progressPercent)}%`, height: '100%', borderRadius: 999 }}
                />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-500 font-medium">
                  {progressMessage || "¡Sigue leyendo!"}
                </Text>
                <Text className="text-xs font-bold" style={{ color: levelColor }}>
                  {Math.round(progressPercent)}%
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* MEDALS */}
        {userMedals && userMedals.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            className="mx-5 mb-6"
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-gray-900">Mis Logros</Text>
              <TouchableOpacity>
                <Text className="text-xs font-bold text-primary">Ver todos</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-1">
              {userMedals.map((medal, index) => (
                <TouchableOpacity
                  key={index}
                  className="mr-4 items-center w-[80px]"
                  activeOpacity={0.7}
                  onPress={() => {
                    if (medal?.medal?.img?.url_secura) {
                      setSelectedMedal({
                        url: medal.medal.img.url_secura,
                        name: medal.medal.name
                      });
                    }
                  }}
                >
                  <View className="w-[70px] h-[70px] bg-white rounded-2xl justify-center items-center shadow-sm shadow-gray-200 mb-2 border border-gray-50">
                    {medal?.medal?.img?.url_secura ? (
                      <Image
                        source={{ uri: medal.medal.img.url_secura }}
                        className="w-12 h-12"
                        resizeMode="contain"
                      />
                    ) : (
                      <MaterialIcons name="emoji-events" size={32} color="#fbbf24" />
                    )}
                  </View>
                  <Text className="text-[10px] text-center font-medium text-gray-600 leading-tight" numberOfLines={2}>
                    {medal.medal.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* PREFERENCES */}
        {user?.preference && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            className="mx-5 mb-6"
          >
            <Text className="text-lg font-bold text-gray-900 mb-3">Mis Preferencias</Text>
            <View className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-200">
              {user.preference.category && user.preference.category.length > 0 && (
                <View className="mb-4">
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Géneros</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {user.preference.category.map((cat, idx) => (
                      <View key={idx} className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                        <Text className="text-xs font-semibold text-indigo-600">{cat}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {user.preference.format && user.preference.format.length > 0 && (
                <View>
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Formatos</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {user.preference.format.map((fmt, idx) => (
                      <View key={idx} className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <Text className="text-xs font-semibold text-emerald-600">{fmt}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* BOOK SECTIONS */}
        <View className="mt-2">
          {progress.filter((item) => item.status === "reading").length > 0 && (
            <Animated.View entering={FadeInDown.delay(500).duration(600)} className="mb-8">
              <View className="px-5 flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-1 h-6 bg-primary rounded-full" />
                  <Text className="text-lg font-bold text-gray-900">Continuar Leyendo</Text>
                </View>
                <View className="bg-primary/10 w-6 h-6 rounded-full justify-center items-center">
                  <Text className="text-xs font-bold text-primary">
                    {progress.filter((item) => item.status === "reading").length}
                  </Text>
                </View>
              </View>
              <BookCarousel
                data={progress.filter((item) => item.status === "reading")}
                onPressItem={(item) => router.push(`/catalogue/${item._id}`)}
              />
            </Animated.View>
          )}

          {progress.filter((item) => item.status === "finished").length > 0 && (
            <Animated.View entering={FadeInDown.delay(600).duration(600)} className="mb-8">
              <View className="px-5 flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-1 h-6 bg-green-500 rounded-full" />
                  <Text className="text-lg font-bold text-gray-900">Terminados</Text>
                </View>
                <View className="bg-green-100 w-6 h-6 rounded-full justify-center items-center">
                  <Text className="text-xs font-bold text-green-600">
                    {progress.filter((item) => item.status === "finished").length}
                  </Text>
                </View>
              </View>
              <BookCarousel
                data={progress.filter((item) => item.status === "finished")}
                onPressItem={(item) => router.push(`/catalogue/${item._id}`)}
              />
            </Animated.View>
          )}

          {progress.filter((item) => item.status === "pending").length > 0 && (
            <Animated.View entering={FadeInDown.delay(700).duration(600)} className="mb-8">
              <View className="px-5 flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-1 h-6 bg-gray-400 rounded-full" />
                  <Text className="text-lg font-bold text-gray-900">Mi Lista</Text>
                </View>
                <View className="bg-gray-100 w-6 h-6 rounded-full justify-center items-center">
                  <Text className="text-xs font-bold text-gray-600">
                    {progress.filter((item) => item.status === "pending").length}
                  </Text>
                </View>
              </View>
              <BookCarousel
                data={progress.filter((item) => item.status === "pending")}
                onPressItem={(item) => router.push(`/catalogue/${item._id}`)}
              />
            </Animated.View>
          )}
        </View>

        {/* LOGOUT BUTTON */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)} className="px-5 py-8 items-center">
          <TouchableOpacity
            className="flex-row items-center bg-white py-4 px-8 rounded-2xl border border-red-100 shadow-sm shadow-red-50"
            activeOpacity={0.7}
            onPress={async () => {
              await SecureStore.deleteItemAsync("token");
              router.replace("/(auth)/signin");
            }}
          >
            <MaterialIcons name="logout" size={20} color="#ef4444" />
            <Text className="text-sm text-red-500 font-bold ml-3">Cerrar Sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* MEDAL MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedMedal}
        onRequestClose={() => setSelectedMedal(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            onPress={() => setSelectedMedal(null)}
          />
          <Animated.View
            entering={FadeInUp.duration(300)}
            className="bg-white p-6 rounded-3xl items-center w-[85%] shadow-2xl"
          >
            <Text className="text-xl font-bold text-gray-900 mb-6 text-center">{selectedMedal?.name}</Text>
            {selectedMedal?.url && (
              <Image
                source={{ uri: selectedMedal.url }}
                className="w-48 h-48 mb-8"
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              className="px-8 py-3 rounded-full shadow-lg shadow-orange-200"
              style={{ backgroundColor: colors.primary }}
              onPress={() => setSelectedMedal(null)}
            >
              <Text className="text-white font-bold text-base">Cerrar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* EDIT PROFILE MODAL */}
      {user && (
        <EditProfileModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          user={user}
          onUpdateSuccess={fetchUserData}
        />
      )}
    </View>
  );
};

export default ProfileScreen;
