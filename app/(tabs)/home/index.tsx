"use client";

import { getBooks } from "@/app/api/catalogue";
import { booksbyRecomendation, getBookbyLatestProgress } from "@/app/api/recomendations";
import { authContext } from "@/app/context/authContext";
import Banner from "@/assets/images/banner.png";
import BookCarousel from "@/components/BookCarousel";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();
  const { isLogin, user } = useContext(authContext);
  const [books, setBooks] = useState<any[]>([]);
  const [recommendations, setRecomendations] = useState<any[]>([]);
  const [booksLatest, setBookLatest] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token || !isLogin) {
        router.push("/(auth)/signin");
      }
    };
    verificarSesion();
  }, [isLogin, router]);

  const fetchAllData = async () => {
    try {
      const [booksData, recommendationsData, latestData] = await Promise.all([
        getBooks(),
        booksbyRecomendation(),
        getBookbyLatestProgress(),
      ]);

      // Filtro preventivo para evitar datos sin _id o estructura incorrecta
      const validBooks = booksData.filter((b: any) => b?._id);
      const validRecs = recommendationsData.filter((b: any) => b?._id);
      const validLatest = latestData.filter((b: any) => b?._id);

      setBooks(validBooks);
      setRecomendations(validRecs);
      setBookLatest(validLatest);

    } catch (error) {
      console.log("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#D97706" />
        <Text className="mt-4 text-secondary text-base">Cargando tu biblioteca...</Text>
      </SafeAreaView>
    );
  }

  const handleBookPress = (book: any) => {
    router.navigate({
      pathname: '/(tabs)/catalogue/[idBook]',
      params: { idBook: book._id }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Header />

        <View className="pb-8">
          {/* Saludo y banner */}
          <View className="px-5 mt-2 mb-6">
            <Text className="text-3xl font-bold text-gray-900">
              {getGreeting()}
              {user?.name ? `, ${user.name}` : ""}
            </Text>
            <Text className="text-base text-gray-600 mt-1">¿Qué te gustaría leer hoy?</Text>
          </View>

          <View className="px-5 mb-6">
            <View className="rounded-2xl overflow-hidden shadow-lg">
              <Image source={Banner} className="w-full h-52" resizeMode="cover" />
            </View>
          </View>

          {/* Métricas */}
          <View className="px-5 mb-6">
            <View className="flex-row justify-between">
              <View className="bg-white rounded-xl p-4 flex-1 mr-2 shadow-sm">
                <Text className="text-2xl font-bold text-primary">{booksLatest.length}</Text>
                <Text className="text-sm text-gray-600 mt-1">En progreso</Text>
              </View>
              <View className="bg-white rounded-xl p-4 flex-1 ml-2 shadow-sm">
                <Text className="text-2xl font-bold text-primary">{books.length}</Text>
                <Text className="text-sm text-gray-600 mt-1">Disponibles</Text>
              </View>
            </View>
          </View>

          {/* Continúa tu progreso */}
          {booksLatest.length > 0 ? (
            <View className="mb-8">
              <View className="px-5 mb-4">
                <Text className="text-2xl text-primary font-bold tracking-tight">Continúa tu progreso</Text>
                <View className="mt-1 w-12 h-1 bg-primary rounded-full" />
              </View>
              <BookCarousel
                data={booksLatest}
                onPressItem={handleBookPress}
              />
            </View>
          ) : (
            <View className="px-5 mb-8">
              <View className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <Text className="text-base font-semibold text-blue-900 mb-1">Comienza tu aventura</Text>
                <Text className="text-sm text-blue-700">
                  Explora nuestra colección y comienza a leer tu primer libro
                </Text>
              </View>
            </View>
          )}

          {/* Recomendaciones */}
          {recommendations.length > 0 && (
            <View className="mb-8">
              <View className="px-5 mb-4">
                <Text className="text-2xl text-primary font-bold tracking-tight">Te podría interesar</Text>
                <View className="mt-1 w-12 h-1 bg-primary rounded-full" />
              </View>
              <BookCarousel
                data={recommendations}
                onPressItem={handleBookPress}
                
              />
            </View>
          )}

          {/* Antologías */}
          {books.length > 0 && (
            <View className="mb-8">
              <View className="px-5 mb-4">
                <Text className="text-2xl text-primary font-bold tracking-tight">Antologías</Text>
                <View className="mt-1 w-12 h-1 bg-primary rounded-full" />
              </View>
              <BookCarousel
                data={books}
                onPressItem={handleBookPress}
               
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
