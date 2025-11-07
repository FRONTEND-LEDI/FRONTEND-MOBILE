import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { Comment, Foro } from "@/types/club";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Socket } from "socket.io-client";

interface CommentsAnswersProps {
  isVisible: boolean;
  onClose: () => void;
  comment: Comment | null;
  socket: Socket | null;
  allForos: Foro[];
}

const getInitials = (name?: string) =>
  name ? name.charAt(0).toUpperCase() : "?";

const CommentsAnswers: React.FC<CommentsAnswersProps> = ({
  isVisible,
  onClose,
  comment,
  socket,
  allForos,
}) => {
  const { user, isLoading: isAuthLoading } = useContext(authContext);
  const [answers, setAnswers] = useState<Comment[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const currentForoTitle =
    allForos.find((f) => f._id === comment?.idForo)?.title ||
    "Foro Desconocido";

  const fetchAnswers = useCallback(() => {
    if (!comment) {
      setIsFetching(false);
      return;
    }

    if (!socket || !socket.connected) {
      Alert.alert("Error", "No hay conexión con el servidor");
      setIsFetching(false);
      return;
    }

    setIsFetching(true);

    socket.emit("all-public-foro", comment.idForo);
  }, [comment, socket]);

  useEffect(() => {
    if (isVisible && comment && socket) {
      fetchAnswers();

      const handleComments = (data: Comment[]) => {
        const safe = Array.isArray(data) ? data : [];
        const filtered = safe.filter(
          (c: Comment) => c.idComent && c.idComent === comment!._id
        );
        setAnswers(filtered);
        setIsFetching(false);
      };

      socket?.on("coments-in-the-foro", handleComments);
      socket?.on("coments", handleComments);

      return () => {
        socket?.off("coments-in-the-foro", handleComments);
        socket?.off("coments", handleComments);
        setIsFetching(false);
      };
    }
  }, [isVisible, fetchAnswers, socket, comment]);

  const handleSendAnswer = () => {
    if (!socket || !socket.connected) {
      Alert.alert("Error", "No hay conexión con el servidor");
      return;
    }

    if (isAuthLoading || !user) {
      Alert.alert("Error", "Debes iniciar sesión para responder");
      return;
    }

    if (!newAnswer.trim()) return;

    const answerData = {
      idForo: comment!.idForo,
      idUser: user._id,
      content: newAnswer.trim(),
    };

    socket.emit("create-answer", comment!._id, answerData);
    const optimisticAnswer: Comment = {
      _id: "",
      idComent: comment!._id,
      idForo: comment!.idForo,
      idUser: user as any,
      content: answerData.content,
      createdAt: new Date().toISOString(),
    };

    setAnswers((prev) => [optimisticAnswer, ...prev]);
    setNewAnswer("");
  };

  const AnswerItem: React.FC<{ answer: Comment }> = ({ answer }) => {
    const replyUserName = answer.idUser.userName || "Usuario";
    return (
      <View key={answer._id} className="py-3 border-b border-gray-100">
        <View className="flex-row items-start">
          <View className="w-8 h-8 rounded-full bg-cyan-500 items-center justify-center mr-3 mt-0.5">
            <Text className="text-sm font-bold text-white">
              {getInitials(replyUserName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-sm mb-0.5 text-gray-700">
              {replyUserName}
            </Text>
            <Text className="text-base text-gray-700">{answer.content}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} className="flex-1 bg-black/50 justify-end">
        <Pressable
          className="bg-white rounded-t-3xl h-5/6 shadow-xl pt-4"
          onPress={() => {}}
        >
          <View className="flex-row justify-between items-center px-5 pb-3 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-800">
              Hilo de: {currentForoTitle}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5 pt-3">
            {comment && (
              <View className="p-4 bg-indigo-50 rounded-xl mb-4 border border-indigo-200">
                <Text className="text-sm font-bold text-indigo-600 mb-2">
                  Publicación Original
                </Text>
                <View className="flex-row items-start">
                  <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-3">
                    <Text className="text-sm font-bold text-white">
                      {getInitials(comment.idUser.userName)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-sm mb-0.5">
                      {comment.idUser.userName || "Usuario"}
                    </Text>
                    <Text className="text-base text-gray-800">
                      {comment.content}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Text className="text-lg font-bold mt-2 mb-3 text-gray-700">
              Respuestas ({answers.length})
            </Text>

            {isFetching && (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                className="mt-5"
              />
            )}

            {!isFetching && answers.length > 0
              ? answers.map((answer) => (
                  <AnswerItem key={answer._id} answer={answer} />
                ))
              : !isFetching && (
                  <Text className="text-center text-gray-500 mt-5">
                    Sé el primero en responder.
                  </Text>
                )}
          </ScrollView>

          <View className="p-3 border-t border-gray-200 bg-white">
            <View className="flex-row items-center bg-gray-100 rounded-full p-1 shadow-md">
              <TextInput
                className="flex-1 min-h-[40px] max-h-32 bg-white rounded-2xl px-4 py-2 text-base border border-gray-300 mr-2"
                placeholder={`Responder a ${
                  comment?.idUser.userName || "Usuario"
                }...`}
                value={newAnswer}
                onChangeText={setNewAnswer}
                multiline
                editable={!isAuthLoading}
              />
              <TouchableOpacity
                className={`w-10 h-10 rounded-full justify-center items-center ${
                  newAnswer.trim() && !isAuthLoading
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
                onPress={handleSendAnswer}
                disabled={!newAnswer.trim() || isAuthLoading}
              >
                <Ionicons name="arrow-up" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default React.memo(CommentsAnswers);
