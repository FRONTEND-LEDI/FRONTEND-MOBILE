// app/club/post/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const mockPost = {
  title: "How To Be A Programmer",
  author: "Joko Ui",
  time: "2h ago",
  body: `Programming is not just about typing code. It's a mindset.`,
  likes: 90,
  comments: 4,
  views: 150,
};

const mockComments = [
  { id: "1", user: "Alice", text: "¡Gran aporte!", time: "1h ago" },
  { id: "2", user: "Bob", text: "Me encanta este tema", time: "45m ago" },
  {
    id: "3",
    user: "Charlie",
    text: "¿Podrías recomendar libros?",
    time: "30m ago",
  },
  { id: "4", user: "Dana", text: "¡Gracias por compartir!", time: "15m ago" },
];

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [comment, setComment] = useState("");

  return (
    <View className="flex-1 bg-light px-4 pt-10">
      <ScrollView className="mb-4">
        <Text className="text-primary font-bold text-2xl mb-2">
          {mockPost.title}
        </Text>
        <Text className="text-dark mb-1">
          Por <Text className="font-semibold">{mockPost.author}</Text> ·{" "}
          {mockPost.time}
        </Text>
        <Text className="text-base text-dark mb-4">{mockPost.body}</Text>

        {/* Stats */}
        <View className="flex-row gap-6 mb-6">
          <View className="flex-row items-center gap-1">
            <Ionicons name="heart" size={18} color="tomato" />
            <Text>{mockPost.likes}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="chatbubble-ellipses" size={18} color="#888" />
            <Text>{mockPost.comments}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="eye" size={18} color="#888" />
            <Text>{mockPost.views}</Text>
          </View>
        </View>

        {/* Comments */}
        <Text className="text-primary text-lg font-bold mb-2">Comentarios</Text>
        <View className="gap-3 mb-4">
          {mockComments.map((c) => (
            <View key={c.id} className="bg-white p-3 rounded-lg shadow-sm">
              <Text className="font-semibold text-dark">
                {c.user}{" "}
                <Text className="text-xs text-gray-500">· {c.time}</Text>
              </Text>
              <Text className="text-dark">{c.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add comment input */}
      <View className="border-t border-gray-300 pt-2 pb-4 bg-light">
        <TextInput
          placeholder="Escribe un comentario..."
          value={comment}
          onChangeText={setComment}
          className="bg-white px-4 py-3 rounded-lg border border-gray-300 mb-2"
        />
        <TouchableOpacity className="bg-primary rounded-lg py-3 items-center">
          <Text className="text-white font-bold">Publicar comentario</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
