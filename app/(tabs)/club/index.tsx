import { getForosApi } from "@/app/api/club";
import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { Comentario, Foro } from "@/types/club";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStorage from "expo-secure-store";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io, Socket } from "socket.io-client";
import ForoTopics from "../../../components/ForoButton";
import DisplayedComment from "../../../components/club/_DisplayComment";

const URL = `http://${IP_ADDRESS}:3402`;

export default function Forum() {
  const [foros, setForos] = useState<Foro[]>([]);
  const [displayedComment, setDisplayedComment] = useState<Comentario[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedForoId, setSelectedForoId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { user } = useContext(authContext);
  const socketRef = useRef<Socket | null>(null);

  const fetchComments = useCallback((foroId: string | null) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;

    if (foroId) {
      currentSocket.emit("all-public-foro", foroId);
    } else {
      currentSocket.emit("all-public");
    }
  }, []);

  useEffect(() => {
    const initializeSocket = async () => {
      const token = await SecureStorage.getItemAsync("token").catch((error) => {
        console.error("Error al obtener token:", error);
        return null;
      });

      const currentSocket = io(URL, {
        auth: { token: token || "" },
      });
      socketRef.current = currentSocket;

      currentSocket.on("connect", () => {
        console.log("Connected to Socket.IO server!", currentSocket.id);
        setIsConnected(true);
        fetchComments(null);
      });
      currentSocket.on("disconnect", () => setIsConnected(false));

      currentSocket.on("coments", (data: Comentario[]) => {
        try {
          const safeData = Array.isArray(data) ? data : [];
          if (!selectedForoId) {
            setDisplayedComment([...safeData].reverse());
          }
        } catch (error) {
          console.error("Error socket get comments", error);
        }
      });
      currentSocket.on("coments-in-the-foro", (data: Comentario[]) => {
        const safeData = Array.isArray(data) ? data : [];
        setDisplayedComment([...safeData].reverse());
      });
      currentSocket.on("coment-created", (newComment: Comentario) => {
        if (!selectedForoId || selectedForoId === newComment.idForo) {
          setDisplayedComment((prev) => [newComment, ...prev]);
        }
      });

      currentSocket.on("error", (error: { msg: string }) => {
        console.error("Socket.IO error:", error.msg);
      });

      const cleanup = () => {
        currentSocket.off("connect");
        currentSocket.off("disconnect");
        currentSocket.off("coments");
        currentSocket.off("coments-in-the-foro");
        currentSocket.off("coment-created");
        currentSocket.off("error");
        currentSocket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        console.log("Disconnecting socket");
      };

      return cleanup;
    };

    const cleanupPromise = initializeSocket();

    const loadForos = async () => {
      try {
        const data = await getForosApi();
        setForos(data);
      } catch (error) {
        console.error("Error al obtener foros", error);
      }
    };
    loadForos();

    // Asegurar que la función de limpieza se ejecute al desmontar
    return () => {
      cleanupPromise.then((cleanup) => cleanup());
    };
  }, [selectedForoId]);

  const handleTopicPress = (foroId: string) => {
    setSelectedForoId(foroId);
    fetchComments(foroId);
  };

  const handleGetAllComments = () => {
    setSelectedForoId(null);
    fetchComments(null);
  };

  const handleSendComment = () => {
    try {
      const currentSocket = socketRef.current;
      if (!currentSocket || !currentSocket.connected) {
        console.warn("Socket no conectado, no se pudo enviar el comentario");
        return;
      }
      const userId = user?.id;
      if (!userId) {
        Alert.alert("Acceso denegado", "No se pudo enviar comentario");
        return;
      }
      if (selectedForoId && newComment.trim()) {
        const commentData = {
          idForo: selectedForoId,
          idUser: userId,
          content: newComment,
        };
        currentSocket.emit("new-public", commentData);
        setNewComment("");
      }
    } catch (error) {
      console.log("Error al enviar comentario", error);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 5,
          paddingTop: 30,
        }}
        className="flex-1 px-6"
      >
        <ForoTopics
          foros={foros}
          selectedForoId={selectedForoId}
          onTopicPress={handleTopicPress}
          onGetAllComments={handleGetAllComments}
        />
        <Text
          className="text-xl font-bold mt-5 mb-3"
          style={{ color: colors.primary }}
        >
          {selectedForoId ? "Comentarios del Foro" : "Todos los comentarios"}
        </Text>

        {displayedComment.map((comment) => (
          <DisplayedComment
            key={comment._id || comment.idComent}
            comment={comment}
            foros={foros}
          />
        ))}

        {displayedComment.length === 0 && (
          <View className="bg-gray-50 p-6 rounded-xl items-center justify-center border border-gray-200">
            <Text className="text-base text-gray-500 font-medium">
              No hay comentarios en este tema. ¡Sé el primero en escribir!
            </Text>
          </View>
        )}
      </ScrollView>

      {selectedForoId ? (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
          <View className="flex-row items-center bg-gray-100 rounded-full border border-gray-300 p-1 shadow-md">
            <TextInput
              className="flex-1 h-10 px-4 py-1 text-base text-gray-800"
              placeholder={`Comentar en: ${
                foros.find((f) => f._id === selectedForoId)?.title ||
                "Foro Seleccionado"
              }...`}
              placeholderTextColor="#9ca3af"
              value={newComment}
              onChangeText={setNewComment}
              editable={!!selectedForoId}
            />
            <TouchableOpacity
              className={`rounded-full p-2 ml-2 ${
                newComment.trim() ? "bg-orange-500" : "bg-gray-300"
              }`}
              onPress={handleSendComment}
              disabled={!newComment.trim()}
            >
              <Ionicons name="arrow-up" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="bg-gray-100 p-4 rounded-xl mx-4 mb-4 items-center justify-center border border-gray-200">
          <Text className="text-base text-gray-500 text-center font-medium">
            Selecciona un tema para participar
          </Text>
        </View>
      )}
      <StatusBar backgroundColor={colors.primary} />
    </KeyboardAvoidingView>
  );
}
