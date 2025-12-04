import { getNarrativeBooks } from "@/app/api/catalogue";
import colors from "@/constants/colors";
import { AuthorType } from "@/types/author";
import { BookType } from "@/types/book";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getAuthorName(authors?: { fullName?: string }[] | AuthorType[]) {
  if (!authors || authors.length === 0) return "Autor desconocido";
  return authors.map((a) => a.fullName ?? "Autor desconocido").join(", ");
}

function getCoverUrl(cover: BookType["bookCoverImage"]) {
  if (!cover) return "https://placehold.co/300x400/222/fff?text=Sin+Portada";
  if (typeof cover === "string") return cover;
  return cover.url_secura;
}

const BookCard = ({ item }: { item: BookType }) => {
  return (
    <Link href={`/(IA)/quiz/${item._id}`} asChild>
      <TouchableOpacity
        className="flex-1 m-2 bg-white rounded-2xl overflow-hidden shadow-md active:opacity-90 active:scale-95"
        style={{ elevation: 4 }}
      >
        <Image source={{ uri: getCoverUrl(item.bookCoverImage) }} className="w-full h-48" resizeMode="cover" />
        <View className="p-3">
          <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-xs text-gray-500 mb-2 font-medium" numberOfLines={1}>
            {getAuthorName(item.author)}
          </Text>
          <View className="flex-row flex-wrap gap-1">
            {item.genre && (
              <View className="px-2 py-0.5 bg-orange-100 rounded-md border border-orange-200">
                <Text className="text-[10px] font-bold text-orange-700 uppercase">{item.genre}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default function BookSelectorScreen() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNarrativeBooks();
        setBooks(data);
      } catch (err) {
        console.error("Error al cargar libros:", err);
        if ((err as Error).message === "Token no encontrado") {
          setError("Debes iniciar sesión para ver los libros.");
        } else {
          setError("Error al cargar los libros.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-lg text-gray-600">Cargando libros...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Text className="text-lg text-red-600 mb-6 text-center">{error}</Text>
        {error.includes("iniciar sesión") && (
          <Link href="/(auth)/signin" asChild>
            <TouchableOpacity className="bg-orange-500 px-8 py-3 rounded-full">
              <Text className="text-white text-base font-semibold">Iniciar sesión</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#F59E0B", "#D97706", "#92400E"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="p-6 pb-2">
          <Text className="text-4xl font-black text-white text-center shadow-sm">PREGUNTADOS</Text>
          <Text className="text-sm text-orange-100 text-center mt-1 font-medium">Elige una historia para comenzar el desafío</Text>
        </View>

        <FlatList
          data={books}
          renderItem={BookCard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          className="flex-1 p-2"
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20 p-6 bg-white/10 rounded-3xl mx-4">
              <Text className="text-lg text-white mb-6 text-center font-bold">No se encontraron libros narrativos disponibles.</Text>
              <TouchableOpacity onPress={() => router.back()} className="bg-white px-8 py-3 rounded-full shadow-lg">
                <Text className="text-orange-600 text-base font-bold">Volver</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            <View className="p-4 items-center mt-2">
              <Text className="text-xs text-orange-200 text-center font-medium">Solo se muestran libros del género Narrativo</Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
