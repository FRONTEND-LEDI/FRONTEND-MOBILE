import { getForosApi } from "@/app/api/club";
import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { Comment, Foro } from "@/types/club";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { io, Socket } from "socket.io-client";
import DisplayedComment from "../../../components/club/_DisplayComments";
import CommentsAnswers from "../../../components/club/CommentsAnswers";
import ForoTopics from "../../../components/ForoButton";

const URL = `http://${IP_ADDRESS}:3402`;

export default function Forum() {
  const [foros, setForos] = useState<Foro[]>([]);
  const [displayedComment, setDisplayedComment] = useState<Comment[]>([]);
  const [selectedForoId, setSelectedForoId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { user, isLoading } = useContext(authContext);
  const socketRef = useRef<Socket | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
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
        fetchComments(null);
      });
      currentSocket.on("disconnect", () => console.log("disconn :("));

      currentSocket.on("coments", (data: Comment[]) => {
        try {
          const safeData = Array.isArray(data) ? data : [];
          if (!selectedForoId) {
            setDisplayedComment([...safeData].reverse());
          }
        } catch (error) {
          console.error("Error socket get comments", error);
        }
      });
      currentSocket.on("coments-in-the-foro", (data: Comment[]) => {
        const safeData = Array.isArray(data) ? data : [];
        setDisplayedComment([...safeData].reverse());
      });
      currentSocket.on("coment-created", (newComment: Comment) => {
        if (!selectedForoId || selectedForoId === newComment.idForo) {
          setDisplayedComment((prev) => [newComment, ...prev]);
        }
        currentSocket.on("update", (data: Comment[]) => {
          setDisplayedComment([...data].reverse());
        });

        currentSocket.on("Delete", (data: Comment[]) => {
          setDisplayedComment([...data].reverse());
        });
        currentSocket.on("error", (error: { msg: string }) => {
          console.error("Socket.IO error:", error.msg);
        });
      });

      const cleanup = () => {
        currentSocket.off("connect");
        currentSocket.off("disconnect");
        currentSocket.off("coments");
        currentSocket.off("coments-in-the-foro");
        currentSocket.off("coment-created");
        currentSocket.off("update");
        currentSocket.off("Delete");
        currentSocket.off("error");
        currentSocket.disconnect();
        socketRef.current = null;
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

    return () => {
      cleanupPromise.then((cleanup) => cleanup());
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
    if (!currentSocket || !currentSocket.connected) {
      Alert.alert("Error", "No hay conexión con el servidor");
      return;
    }

    if (isLoading) {
      Alert.alert("Espere", "Verificando sesión...");
      return;
    }

    if (!user) {
      Alert.alert("Acceso denegado", "Inicia sesión para poder comentar");
      return;
    }

    if (selectedForoId && newComment.trim()) {
      const commentData = {
        idForo: selectedForoId,
        idUser: user._id,
        content: newComment,
      };
      currentSocket.emit("new-public", commentData);
      setNewComment("");
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white">
      <GestureHandlerRootView>
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
              key={comment._id}
              comment={comment}
              foros={foros}
              socket={socketRef.current}
              onViewThread={(c) => {
                setSelectedComment(c);
                setModalVisible(true);
              }}
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
        <CommentsAnswers
          isVisible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedComment(null);
          }}
          comment={selectedComment}
          socket={socketRef.current}
          allForos={foros}
        />

        <StatusBar backgroundColor={colors.primary} />
      </GestureHandlerRootView>
    </KeyboardAvoidingView>
  );
}
