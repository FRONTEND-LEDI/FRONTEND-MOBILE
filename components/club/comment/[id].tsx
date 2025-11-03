import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { Comment } from "@/types/club";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io, Socket } from "socket.io-client";

const URL = `http://${IP_ADDRESS}:3402`;

const getInitials = (name?: string) =>
  name ? name.charAt(0).toUpperCase() : "?";

export default function CommentThreadScreen() {
  const { threadId } = useLocalSearchParams();
  const [answers, setAnswers] = useState<Comment[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const { user, isLoading } = useContext(authContext);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const currentSocket = io(URL);
    socketRef.current = currentSocket;

    currentSocket.on("connect", () => {
      console.log(`Conectado al hilo: ${threadId}`);
      // Pides las respuestas para el ID del Comment principal (threadId)
      currentSocket.emit("get-foro-id", threadId);
      currentSocket.emit("get-answers-for-coment", threadId);
    });

    currentSocket.on("foro-data", (data: Comment) => {
      setParentComment(data);
    });

    currentSocket.on("answers-for-coment", (data: Comment[]) => {
      setAnswers(data);
    });

    currentSocket.on("answer-created", (newAnswer: Comment) => {
      setAnswers((prev) => [newAnswer, ...prev]);
    });

    currentSocket.on("error", (error: { msg: string }) => {
      console.error("Socket.IO error en hilo:", error.msg);
      Alert.alert("Error de Socket", error.msg);
    });

    return () => {
      currentSocket.off("connect");
      currentSocket.off("foro-data");
      currentSocket.off("answers-for-coment");
      currentSocket.off("answer-created");
      currentSocket.off("error");
      currentSocket.disconnect();
    };
  }, [threadId]);

  const handleSendAnswer = () => {
    const currentSocket = socketRef.current;

    if (isLoading) {
      Alert.alert("Espere", "Verificando sesión...");
      return;
    }

    if (!currentSocket || !currentSocket.connected || !user || !threadId) {
      Alert.alert(
        "Error",
        "Debes estar conectado e iniciar sesión para responder."
      );
      return;
    }

    if (!newAnswer.trim()) {
      return;
    }

    if (newAnswer.trim()) {
      const answerData = {
        idForo: parentComment?.idForo,
        idUser: user._id,
        content: newAnswer,
      };

      currentSocket.emit("create-answer", threadId, answerData);
      setNewAnswer("");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerTitle: parentComment
            ? `Hilo de ${parentComment.idUser.userName}`
            : "Respuestas",
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView className="p-4 flex-1">
        <View className="p-4 bg-blue-50 rounded-xl mb-5 border border-blue-200">
          <Text className="text-sm font-bold text-blue-600 mb-2">
            Comment Original
          </Text>
          <View className="flex-row items-start">
            <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-3 mt-0.5">
              <Text className="text-sm font-bold text-white">
                {getInitials(parentComment?.idUser.userName)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-sm mb-0.5">
                {parentComment?.idUser.userName || "Cargando..."}
              </Text>
              <Text className="text-base text-gray-800">
                {parentComment?.content || "Cargando contenido..."}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-xl font-bold mb-3">
          Respuestas ({answers.length})
        </Text>

        {answers.map((answer) => (
          <View key={answer._id} className="py-3 border-b border-gray-100">
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-cyan-500 items-center justify-center mr-3 mt-0.5">
                <Text className="text-sm font-bold text-white">
                  {getInitials(answer.idUser.userName)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-sm mb-0.5">
                  {answer.idUser.userName || "Usuario"}
                </Text>
                <Text className="text-base text-gray-700">
                  {answer.content}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {answers.length === 0 && (
          <Text className="text-center text-gray-500 mt-5">
            Este hilo no tiene respuestas aún.
          </Text>
        )}
      </ScrollView>

      <View className="flex-row p-3 border-t border-gray-200 bg-gray-50 items-end">
        <TextInput
          className="flex-1 min-h-[40px] max-h-32 bg-white rounded-2xl px-4 py-2 text-base border border-gray-300 mr-2"
          placeholder="Escribe tu respuesta..."
          value={newAnswer}
          onChangeText={setNewAnswer}
          multiline
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity
          className={`w-10 h-10 rounded-full justify-center items-center ${
            newAnswer.trim() && !isLoading ? "bg-green-500" : "bg-gray-400"
          }`}
          onPress={handleSendAnswer}
          disabled={!newAnswer.trim() || isLoading}
        >
          <Ionicons name="arrow-up" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
