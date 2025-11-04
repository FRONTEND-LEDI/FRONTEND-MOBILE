import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { Comment, Foro } from "@/types/club"; // Asumimos que Comment y Foro están aquí
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

// Definimos los tipos de props del modal
interface CommentsAnswersProps {
  isVisible: boolean;
  onClose: () => void;
  // El comentario principal que estamos viendo
  comment: Comment | null;
  socket: Socket | null;
  allForos: Foro[];
}

// Función auxiliar para obtener iniciales
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
  // NOTA: no retornamos temprano aquí para que los hooks siempre se ejecuten.
  // La comprobación de render la haremos justo antes del return JSX.

  // No accedemos a 'comment' hasta confirmar que existe; calculamos valores de forma segura
  const currentForoTitle =
    allForos.find((f) => f._id === comment?.idForo)?.title ||
    "Foro Desconocido";

  // --- LÓGICA DE SOCKET.IO PARA RESPUESTAS ---
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
    // Emitir evento para pedir todos los comentarios del foro; luego filtraremos
    socket.emit("all-public-foro", comment.idForo);
  }, [comment?.idForo, socket]);

  useEffect(() => {
    // Al abrir el modal, cargamos las respuestas
    if (isVisible && comment) {
      fetchAnswers();

      // Cuando el backend responde con los comentarios del foro
      const handleForoComments = (data: Comment[] | any) => {
        const safe = Array.isArray(data) ? data : [];
        const filtered = safe.filter(
          (c: Comment) => c.idComent === comment!._id
        );
        setAnswers(filtered);
        setIsFetching(false);
      };

      // El backend también emite 'coments' tras crear/editar/eliminar; lo usamos para mantener actualizado el hilo
      const handleAllComments = (data: Comment[] | any) => {
        const safe = Array.isArray(data) ? data : [];
        const filtered = safe.filter(
          (c: Comment) => c.idComent === comment!._id
        );
        setAnswers(filtered);
        setIsFetching(false);
      };

      socket?.on("coments-in-the-foro", handleForoComments);
      socket?.on("coments", handleAllComments);

      return () => {
        socket?.off("coments-in-the-foro", handleForoComments);
        socket?.off("coments", handleAllComments);
        setIsFetching(false);
      };
    }
  }, [isVisible, fetchAnswers, socket, comment]);

  // --- Manejador de Envío de Respuesta ---
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
      idForo: comment!.idForo, // ID del foro del comentario original
      idUser: user._id, // ID del usuario logueado (normalizado por ti)
      content: newAnswer.trim(),
    };

    // 3. Emitir evento para crear respuesta, pasando el ID del comentario padre y los datos
    socket.emit("create-answer", comment!._id, answerData);
    // optimistically add (crear objeto que cumpla la forma de Comment)
    const optimisticAnswer: Comment = {
      _id: `temp-${Date.now()}`,
      idComent: comment!._id,
      idForo: comment!.idForo,
      idUser: (user as any) || "",
      content: answerData.content,
      createdAt: new Date().toISOString(),
    };

    setAnswers((prev) => [optimisticAnswer, ...prev]);
    setNewAnswer("");
  };

  // Función auxiliar para renderizar una respuesta

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
      {/* Fondo Oscurecido */}
      <Pressable onPress={onClose} className="flex-1 bg-black/50 justify-end">
        {/* Contenedor Principal (previene cierre al tocar dentro) */}
        <Pressable
          className="bg-white rounded-t-3xl h-5/6 shadow-xl pt-4"
          onPress={() => {}}
        >
          {/* Encabezado y Botón de Cierre */}
          <View className="flex-row justify-between items-center px-5 pb-3 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-800">
              Hilo de: {currentForoTitle}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5 pt-3">
            {/* COMENTARIO PRINCIPAL */}
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

            {/* LISTA DE RESPUESTAS */}
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

          {/* INPUT PARA RESPONDER (fijado abajo) */}
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
