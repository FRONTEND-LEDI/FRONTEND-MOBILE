import { getForosApi } from "@/app/api/club";
import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
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
const DisplayedComment = React.memo(
  ({ comment, foros }: { comment: Comentario; foros: Foro[] }) => {
    DisplayedComment.displayName = "DisplayedComment";
    const userName =
      typeof comment.idUser === "string"
        ? "Usuario"
        : comment.idUser.userName || "Usuario";

    const isGeneralView = !foros.some((f) => f._id === comment.idForo);
    const foroTitle =
      foros.find((f) => f._id === comment.idForo)?.title || "un Foro";

    const getInitials = (name: string) => name.charAt(0).toUpperCase();

    return (
      <View
        key={comment._id || Math.random()}
        className="bg-orange-100 p-3 rounded-xl mb-3 border border-orange-200 shadow-sm"
      >
        {/* Display de Nombre y Avatar (inicial) */}
        <View className="flex-row items-center mb-1">
          <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-3">
            <Text className="text-sm font-bold text-white">
              {getInitials(userName)}
            </Text>
          </View>
          <Text className="text-base font-semibold text-orange-800">
            {userName}
          </Text>
          {isGeneralView && (
            <Text className="text-xs text-gray-500 ml-2">en {foroTitle}</Text>
          )}
        </View>
        {/* Contenido del comentario */}
        <Text className="text-base text-gray-800 ml-11 mt-1">
          {comment.content}
        </Text>
        <Text className="text-xs text-gray-400 text-right mt-1">
          {comment.createdAt
            ? new Date(comment.createdAt).toLocaleTimeString()
            : ""}
        </Text>
      </View>
    );
  }
);

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
    const token = SecureStorage.getItemAsync("token");
    const socket = io(URL, {
      auth: { token },
    });

    socketRef.current = socket;

    const loadForos = async () => {
      try {
        const data = await getForosApi();
        setForos(data);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los foros");
      }
    };
    loadForos();

    socket.on("connect", () => {
      setIsConnected(true);
      fetchComments(selectedForoId);
    });

    socket.on("coments", (data: Comentario[]) => {
      const safeData = Array.isArray(data) ? data : [];
      if (!selectedForoId) {
        setDisplayedComment([...safeData].reverse());
      }
    });

    socket.on("coments-in-the-foro", (data: Comentario[]) => {
      const safeData = Array.isArray(data) ? data : [];
      setDisplayedComment([...safeData].reverse());
    });

    socket.on("coment-created", (newComment: Comentario) => {
      if (!selectedForoId || selectedForoId === newComment.idForo) {
        setDisplayedComment((prev) => [newComment, ...prev]);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedForoId, fetchComments]);

  const handleTopicPress = (foroId: string) => {
    setSelectedForoId(foroId);
    fetchComments(foroId);
  };

  const handleGetAllComments = () => {
    setSelectedForoId(null);
    fetchComments(null);
  };

  const handleSendComment = () => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !selectedForoId || !newComment.trim()) return;

    const commentData = {
      idForo: selectedForoId,
      idUser: user?.id || "anonymous_user",
      content: newComment,
    };

    currentSocket.emit("new-public", commentData);
    setNewComment("");
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

        {displayedComment.map((comment) => (
          <DisplayedComment
            key={comment._id || comment.idComent}
            comment={comment}
            foros={foros}
          />
        ))}

        {/* Mensaje si no hay comentarios */}
        {displayedComment.length === 0 && (
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
