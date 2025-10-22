import { getAuthorById } from "@/app/api/author";
import { AuthorType } from "@/types/author";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function Author() {
  const { idAuthor } = useLocalSearchParams<{ idAuthor: string }>();
  const [author, setAuthor] = useState<AuthorType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!idAuthor) {
        setError("ID de autor no proporcionado");
        setLoading(false);
        return;
      }

      try {
        const data = await getAuthorById(idAuthor);
        setAuthor(data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar el autor:", err);
        setError("No se pudo cargar la información del autor.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [idAuthor]);

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-500">Cargando autor...</Text>
      </View>
    );
  }

  if (error || !author) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-center text-red-600 font-medium">
          {error || "Autor no encontrado"}
        </Text>
      </View>
    );
  }

  const formattedBirthDate = author.birthdate
    ? new Date(author.birthdate).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Fecha no disponible";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Avatar y nombre */}
        <View className="items-center justify-center my-6 ">
          <Image
            source={{
              uri:
                author.avatar.url_secura ??
                "https://imgs.search.brave.com/-QlOJZyWyUVMnRffakwLvvFi5NlMcWVcb_4v6MgFZGI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTQ5/NTA4ODA0My9lcy92/ZWN0b3IvaWNvbm8t/ZGUtcGVyZmlsLWRl/LXVzdWFyaW8tYXZh/dGFyLW8taWNvbm8t/ZGUtcGVyc29uYS1m/b3RvLWRlLXBlcmZp/bC1zJUMzJUFEbWJv/bG8tZGUtcmV0cmF0/by5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9bVkzZ25qMmxV/N2toZ0xoVjZkUUJO/cW9tRUdqM2F5V0gt/eHRwWXVDWHJ6az0",
            }}
            className="w-40 h-40 rounded-full border-4 border-primary shadow-md"
            onError={(e) =>
              console.log("Error al cargar imagen:", e.nativeEvent.error)
            }
          />
          <Text className="font-bold text-center text-3xl mt-4 text-gray-800">
            {author.fullName || "Desconocido"}
          </Text>
          <Text className="text-primary font-semibold mt-1 text-center ">
            {author.profession || "Desconocido"}
          </Text>
        </View>

        {/* Información personal */}
        <View className="mx-6 mb-6 p-4 bg-white rounded-xl shadow-sm">
          <Text className="font-semibold text-xl mb-3 text-gray-800">
            Información personal
          </Text>

          <View className="flex-row items-center mb-2">
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#D97706"
              className="mr-3"
            />
            <Text className="text-gray-600">
              <Text className="font-medium">
                Nacimiento: {formattedBirthDate || "Desconocidos"}
              </Text>
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons
              name="location-outline"
              size={20}
              color="#D97706"
              className="mr-3"
            />
            <Text className="text-gray-600">
              <Text className="font-medium">
                Lugar: {author.birthplace || "Desconocido"}
              </Text>
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons
              name="flag-outline"
              size={20}
              color="#D97706"
              className="mr-3"
            />
            <Text className="text-gray-600">
              <Text className="font-medium">
                Nacionalidad: {author.nationality || "Desconocido"}
              </Text>
            </Text>
          </View>
        </View>
        {/* Géneros literarios */}
        {author.writingGenre && author.writingGenre.length > 0 && (
          <View className="mx-6 mb-6 p-4 bg-white rounded-xl shadow-sm">
            <Text className="font-semibold text-xl mb-3 text-gray-800">
              Géneros literarios
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {author.writingGenre.map((genre, index) => (
                <View
                  key={index}
                  className="px-3 py-1 border-2 border-secondary rounded-full"
                >
                  <Text className="text-primary text-sm font-medium">
                    {genre}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Biografía */}
        <View className="mx-6 mb-6 p-4 bg-white rounded-xl shadow-sm">
          <Text className="font-semibold text-xl mb-3 text-gray-800">
            Biografía
          </Text>
          <Text className="text-base text-gray-600 leading-relaxed">
            {author.biography || "Biografía no disponible."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
