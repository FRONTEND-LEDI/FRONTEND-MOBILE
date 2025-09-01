import { getAuthorById } from "@/app/api/author";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, SafeAreaView, Text, View } from "react-native";

export default function Author() {
  const { idAuthor } = useLocalSearchParams();
  const [author, setAuthor] = useState<Author | null>(null);

  type Author = {
    _id: string;
    name: string;
    biography: string;
    avatar: {
      id_image: string;
      url_secura: string;
    };
  };

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const data = await getAuthorById(idAuthor as string);

        setAuthor(data);

      } catch (error) {
        console.error("Error en getAuthorById:", error);
        throw error;
      }
    };
    fetchAuthor();
  }, [idAuthor]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-col items-center justify-center my-4 ">
         <Image source={{ uri: author?.avatar.url_secura }} className="w-40 h-40 rounded-full border-2 border-primary mx-4"></Image>
        <Text className="font-semibold text-center text-2xl mx-2">
          {author?.name}
        </Text>
      </View>
      <View className="flex row items-center justify-center mx-6">
        <Text>{author?.biography}</Text>
      </View>
    </SafeAreaView>
  );
}
