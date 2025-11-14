import { getNarrativeBooks } from "@/app/api/catalogue";
import colors from "@/constants/colors";
import { AuthorType } from "@/types/author";
import { BookType } from "@/types/book";
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
      <TouchableOpacity className="flex-1 m-2 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 active:opacity-70 active:scale-95">
        <Image source={{ uri: getCoverUrl(item.bookCoverImage) }} className="w-full h-48" resizeMode="cover" />
        <View className="p-4">
          <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-sm text-gray-500 mb-2" numberOfLines={1}>
            {getAuthorName(item.author)}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {item.genre && (
              <View className="px-2 py-0.5 bg-blue-100 rounded-full">
                <Text className="text-xs text-blue-800">{item.genre}</Text>
              </View>
            )}
            {item.format && (
              <View className="px-2 py-0.5 bg-orange-100 rounded-full">
                <Text className="text-xs text-orange-800">{item.format}</Text>
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
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="p-5 border-b border-gray-200">
        <Text className="text-3xl font-bold text-orange-500 text-center">Preguntados</Text>
        <Text className="text-base text-gray-500 text-center mt-1">Elige un libro narrativo para jugar al quiz</Text>
      </View>

      <FlatList
        data={books}
        renderItem={BookCard}
        keyExtractor={(item) => item._id}
        numColumns={2}
        className="flex-1 p-2"
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20 p-6">
            <Text className="text-lg text-gray-500 mb-6 text-center">No se encontraron libros narrativos disponibles.</Text>
            <TouchableOpacity onPress={() => router.back()} className="bg-gray-200 px-8 py-3 rounded-full">
              <Text className="text-gray-800 text-base font-semibold">Volver</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View className="p-4 items-center mt-4">
            <Text className="text-sm text-gray-400 text-center">💡 Solo se muestran libros del género Narrativo para el quiz</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
