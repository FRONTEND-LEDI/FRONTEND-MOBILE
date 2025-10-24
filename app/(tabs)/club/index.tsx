import { getForosApi } from "@/app/api/club";
import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
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

const URL = `http://${IP_ADDRESS}:3402`;

type Foro = {
  _id: string;
  title: string;
  description: string;
};
type CommentUser = {
  _id: string;
  userName?: string;
};

type Comentario = {
  _id: string;
  idComent?: string;
  idForo: string;
  idUser: string | CommentUser;
  content: string;
  createdAt?: string;
};

export default function Forum() {
  const [foros, setForos] = useState<Foro[]>([]);
  const [displayedComentarios, setDisplayedComentarios] = useState<
    Comentario[]
  >([]);

  const [selectedForoId, setSelectedForoId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { user } = useContext(authContext);
  const socketRef = useRef<Socket | null>(null);

  const fetchComments = useCallback((foroId: string | null) => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !currentSocket.connected) {
      console.log("Socket no conectado no se puede solicitar comentarios");
      return;
    }
    if (foroId) {
      console.log("Pidiendo comentarios para foro: ", foroId);
      // solicitar los comentarios del foro
      currentSocket.emit("all-public-foro", foroId);
    } else {
      console.log("Pidiendo todos los comentarios");
      currentSocket.emit("all-public");
    }
  }, []);

  useEffect(() => {
    const currentSocket = io(URL);
    socketRef.current = currentSocket;
    console.log("Pantalla concentrada...");

    const loadForos = async () => {
      const data = await getForosApi();
      setForos(data);
    };
    loadForos();
    currentSocket.on("connect", () => {
      console.log("Connected to Socket.IO server!", currentSocket.id);
      currentSocket.emit("get-all-foros");
      fetchComments(null);
    });

    currentSocket.on("coments", (data: Comentario[]) => {
      const safeData = Array.isArray(data) ? data : [];
      if (!selectedForoId) {
        setDisplayedComentarios([...safeData].reverse());
      }
    });

    currentSocket.on("coments-in-the-foro", (data: Comentario[]) => {
      const safeData = Array.isArray(data) ? data : [];
      console.log("Largo de los comentarios", safeData.length);
      setDisplayedComentarios([...safeData].reverse());
    });

    currentSocket.on("coment-created", (newComment: Comentario) => {
      const targetId =
        typeof newComment.idUser === "string"
          ? newComment.idForo
          : newComment.idForo;

      if (!selectedForoId || selectedForoId === targetId) {
        setDisplayedComentarios((prev) => [newComment, ...prev]);
      }
    });

    currentSocket.on("error", (error: { msg: string }) => {
      console.error("Socket.IO error:", error.msg);
    });

    return () => {
      currentSocket.off("connect");
      currentSocket.off("coments");
      currentSocket.off("coments-in-the-foro");
      currentSocket.off("coment-created");
      currentSocket.off("error");
      currentSocket.disconnect();
      socketRef.current = null;
      console.log("Disconnecting socket");
    };
  }, []);

  const handleTopicPress = (foroId: string) => {
    console.log("handleTopicPress called with:", foroId);
    setSelectedForoId(foroId);
    fetchComments(foroId);
  };

  useEffect(() => {
    console.log("selectedForoId changed:", selectedForoId);
  }, [selectedForoId]);

  const handleGetAllComments = () => {
    try {
      setSelectedForoId(null);
      fetchComments(null);
    } catch (error) {
      console.log("Error al traer todos los comentarios", error);
    }
  };

  const handleSendComment = () => {
    try {
      const currentSocket = socketRef.current;
      if (!currentSocket || !currentSocket.connected) {
        console.warn("Socket no conectado, no se pudo enviar el comentario.");
        return;
      }
      if (selectedForoId && newComment.trim()) {
        const commentData = {
          idForo: selectedForoId,
          idUser: user?.id || "anonymous_user",
          content: newComment,
        };
        currentSocket.emit("new-public", commentData);
        setNewComment("");
      }
    } catch (error) {
      console.log("Error al enviar Comentario", error);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior="padding">
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
        {/* Titulo de los comentarios */}
        <Text
          className="text-xl font-bold mt-5 mb-3"
          style={{ color: colors.primary }}
        >
          {selectedForoId ? "Comentarios del Foro" : "Todos los comentarios"}
        </Text>

        {displayedComentarios.map((comment) => {
          let userName: string;

          if (typeof comment.idUser === "string") {
            userName = "Usuario Desconocido";
          } else {
            userName = comment.idUser.userName || "Usuario";
          }
          return (
            <View
              // Usamos el ID del comentario, si no existe (raro), usamos un random
              key={comment._id || Math.random()}
              className="bg-orange-100 p-3 rounded-xl mb-3 border border-orange-200 shadow-sm"
            >
              {/* Display de Nombre y Avatar (inicial) */}
              <View className="flex-row items-center mb-1">
                <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-3">
                  <Text className="text-sm font-bold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-base font-semibold text-orange-800">
                  {userName}
                </Text>
                {!selectedForoId && (
                  <Text className="text-xs text-gray-500 ml-2">
                    en{" "}
                    {foros.find((f) => f._id === comment.idForo)?.title ||
                      "un Foro"}
                  </Text>
                )}
              </View>
              <Text className="text-base text-gray-800 ml-11 mt-1">
                {comment.content}
              </Text>
              <Text className="text-xs text-gray-400 text-right mt-1">
                {comment.createdAt
                  ? new Date(comment.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </Text>
            </View>
          );
        })}

        {/* Mensaje si no hay comentarios */}
        {displayedComentarios.length === 0 && (
          <View className="bg-gray-50 p-6 rounded-xl items-center justify-center border border-gray-200">
            <Text className="text-base text-gray-500 font-medium">
              No hay comentarios en este tema. ¡Sé el primero en escribir!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input de Comentario */}
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
