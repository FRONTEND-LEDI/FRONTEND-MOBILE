import { getAuthorById } from "@/app/api/author";
import { AuthorType } from '@/types/author';
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, View } from "react-native";

export default function Author() {
  const { idAuthor } = useLocalSearchParams();
  const [author, setAuthor] = useState<AuthorType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

 

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const data = await getAuthorById(idAuthor as string);
        setAuthor(data);
      } catch (error) {
        console.error("Error en getAuthorById:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthor();
  }, [idAuthor]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Sección del perfil del autor */}
        <View className="items-center justify-center my-6">
          <Image
            source={{ uri: author?.avatar.url_secura }}
            className="w-40 h-40 rounded-full border-4 border-primary shadow-lg"
          />
          <Text className="font-bold text-center text-3xl mt-4 text-gray-800">
            {author?.fullName } 
          </Text>
        </View>

        {/* Sección de biografía */}
        <View className="mx-6 mb-6">
          <Text className="font-semibold text-xl mb-2 text-gray-700">
            Biografía
          </Text>
          <Text className="text-base text-gray-600 leading-6">
            {author?.biography}
          </Text>
        </View>

        {/* Sección de bibliografía */}
        {author?.bibliography && author.bibliography.length > 0 && (
          <View className="mx-6 mb-6">
            <Text className="font-semibold text-xl mb-2 text-gray-700">
              Obras destacadas
            </Text>
            {author.bibliography.map((work, index) => (
              <Text
                key={index}
                className="text-base text-gray-600 leading-6 mb-1"
              >
                • {work}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
