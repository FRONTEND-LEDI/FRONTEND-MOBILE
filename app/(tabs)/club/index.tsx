import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useContext, useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io, Socket } from "socket.io-client";
import TopicCard from "../../../components/club/TopicCard";

const URL = `http://${IP_ADDRESS}:3402`;
let socket: Socket;

type Foro = {
  _id: string;
  title: string;
  description: string;
};

// --- Interfaces para el nuevo backend poblado ---
type CommentUser = {
  _id: string; // ID del usuario
  userName: string;
  email: string;
  // El avatar NO viene aquí, se debe hacer un fetch separado.
};

type Comentario = {
  _id: string; // Ya que vienen de MongoDB, se asume que tienen _id
  idComent?: string; // Mantener por si acaso, pero _id es principal
  idForo: string;
  idUser: CommentUser; // Ahora es el objeto poblado
  content: string;
  createdAt: string; // Propiedad añadida del log de backend
};
// -----------------------------------------------

export default function Forum() {
  const [foros, setForos] = useState<Foro[]>([]);
  // rawComentarios ahora usará la nueva interfaz
  const [rawComentarios, setRawComentarios] = useState<Comentario[]>([]);
  const [displayedComentarios, setDisplayedComentarios] = useState<
    Comentario[]
  >([]);

  // Estado para caché de Avatares: { userId: avatarUrl }
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});

  const [selectedForoId, setSelectedForoId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  // user del contexto de autenticación (contiene ID de usuario)
  const { user } = useContext(authContext);

  // userA: Para tener el perfil completo (incluyendo avatar) del usuario actual
  const [userA, setUserA] = useState<any | null>(null);

  /**
   * Obtiene la URL del avatar para un usuario dado.
   * Si no está en caché, lo trae del backend.
   * @param userId ID del usuario cuyo avatar se necesita.
   */
  const fetchUserAvatar = async (userId: string) => {
    // Si ya lo tenemos en caché, salimos
    if (userAvatars[userId]) return;

    const token = await SecureStore.getItemAsync("token");
    if (!token) return;

    try {
      const req = await fetch(`http://${IP_ADDRESS}:3402/oneUser/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });
      const res = await req.json();

      if (res.result && res.result.avatar?.avatars?.url_secura) {
        setUserAvatars((prev) => ({
          ...prev,
          [userId]: res.result.avatar.avatars.url_secura,
        }));
      } else {
        // Establecer un valor para evitar reintentos fallidos
        setUserAvatars((prev) => ({ ...prev, [userId]: "default" }));
      }
    } catch (error) {
      console.error("Error fetching avatar for user :", userId, error);
    }
  };

  // Traer el perfil completo del usuario actual al cargar
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;
      try {
        const userReq = await fetch(`http://${IP_ADDRESS}:3402/oneUser`, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });
        const userRes = await userReq.json();
        // userA contendrá el avatar del usuario logueado para usarlo en el input de comentario
        setUserA(userRes.result);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // FILTRADO DE COMENTARIOS
  useEffect(() => {
    if (selectedForoId) {
      // Usamos getComentsByForo del backend (nuevo evento)
      socket.emit("all-public-foro", selectedForoId);
      // La respuesta llegará en socket.on("coments-in-the-foro") y actualizará rawComentarios
    } else {
      // Si no hay foro seleccionado, mostramos todos
      setDisplayedComentarios([...rawComentarios].reverse());
    }
    // NOTA: rawComentarios se actualizará a través de los eventos de socket
  }, [selectedForoId, rawComentarios]);

  // INICIALIZACIÓN Y LISTENERS DE SOCKET.IO
  useEffect(() => {
    socket = io(URL);
    console.log("Pantalla concentrada...");

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server!", socket.id);
      socket.emit("get-all-foros");
      socket.emit("all-public"); // Cargar todos los comentarios inicialmente
    });

    socket.on("all-foros", (data: Foro[]) => {
      const safeData = Array.isArray(data) ? data : [];
      setForos(safeData);
    });

    // Listener general para todos los comentarios (usado por "all-public")
    socket.on("coments", (data: Comentario[]) => {
      const safeData = Array.isArray(data) ? data : [];
      setRawComentarios(safeData);

      // --- NUEVA LÓGICA DE AVATAR ---
      // 1. Obtener IDs únicos de los usuarios en los nuevos comentarios
      const uniqueUserIds = Array.from(
        new Set(safeData.map((c) => c.idUser._id))
      );
      // 2. Intentar obtener los avatares que faltan
      uniqueUserIds.forEach((id) => {
        if (!userAvatars[id] || userAvatars[id] === "default") {
          fetchUserAvatar(id);
        }
      });
      // -----------------------------
    });

    // NUEVO Listener para comentarios filtrados por foro
    socket.on("coments-in-the-foro", (data: Comentario[]) => {
      const safeData = Array.isArray(data) ? data : [];
      setRawComentarios(safeData);
      setDisplayedComentarios([...safeData].reverse()); // Mostrar la lista filtrada

      // Lógica de avatar para comentarios filtrados
      const uniqueUserIds = Array.from(
        new Set(safeData.map((c) => c.idUser._id))
      );
      uniqueUserIds.forEach((id) => {
        if (!userAvatars[id] || userAvatars[id] === "default") {
          fetchUserAvatar(id);
        }
      });
    });

    // Se eliminó socket.on("coment-created") porque el backend ahora emite 'coments' a todos
    // y eso ya actualiza rawComentarios.

    socket.on("error", (error: { msg: string }) => {
      console.error("Socket.IO error:", error.msg);
    });

    return () => {
      socket.off("connect");
      socket.off("all-foros");
      socket.off("coments");
      socket.off("coments-in-the-foro"); // Desconectar el nuevo listener
      socket.off("error");
      socket.disconnect();
      console.log("Disconnecting socket");
    };
  }, []); // Dependencias vacías para ejecución única

  const handleTopicPress = (foroId: string) => {
    setSelectedForoId(foroId);
    // Solicitamos al backend solo los comentarios de ese foro
    // La respuesta llegará por "coments-in-the-foro"
  };

  const handleGetAllComments = () => {
    setSelectedForoId(null);
    // Solicitamos al backend todos los comentarios
    socket.emit("all-public");
  };

  const handleSendComment = () => {
    if (selectedForoId && newComment.trim()) {
      const commentData = {
        idForo: selectedForoId,
        // Mandamos solo el ID, el backend se encarga de poblarlo en la respuesta.
        idUser: user?.id || "anonymous_user",
        content: newComment,
      };
      socket.emit("new-public", commentData);
      setNewComment("");
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-0 py-1"
        >
          <TouchableOpacity
            key="get-all"
            onPress={handleGetAllComments}
            className={`mr-2 ${!selectedForoId ? "  rounded-xl" : ""}`}
          >
            <TopicCard
              title="General"
              color={colors.secondary}
              description="Trae todos"
            />
          </TouchableOpacity>

          {foros.map((item) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => handleTopicPress(item._id)}
              className={`mr-2 ${
                selectedForoId === item._id ? " rounded-xl" : ""
              }`}
            >
              <TopicCard
                title={item.title}
                posts={0}
                color="#f29200"
                description={item.description}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Titulo de los comentarios */}
        <Text
          className="text-xl font-bold mt-5 mb-3"
          style={{ color: colors.primary }}
        >
          {selectedForoId ? "Comentarios del Foro" : "Todos los comentarios"}
        </Text>

        {/* LISTA DE COMENTARIOS FILTRADOS*/}
        {displayedComentarios.map((comment) => {
          const userId = comment.idUser._id;
          const userName = comment.idUser.userName || "Usuario Desconocido";
          const avatarUrl = userAvatars[userId];

          return (
            <View
              key={comment._id || Math.random()}
              className="bg-orange-100 p-3 rounded-xl mb-3 border border-orange-200 shadow-sm"
            >
              {/* Display de Nombre y Avatar */}
              <View className="flex-row items-center mb-1">
                {/* Avatar Dinámico */}
                <View className="w-8 h-8 rounded-full bg-orange-300 items-center justify-center mr-3 overflow-hidden">
                  {avatarUrl && avatarUrl !== "default" ? (
                    <Image
                      className="w-full h-full rounded-full"
                      source={{ uri: avatarUrl }}
                    />
                  ) : (
                    // Placeholder si el avatar no está cargado o no existe
                    <Ionicons
                      name="person-circle"
                      size={30}
                      color={colors.primary}
                    />
                  )}
                </View>
                {/* Nombre del Usuario */}
                <Text className="text-base font-semibold text-orange-800">
                  {userName}
                </Text>
                {/* Opcional: Mostrar el foro al que pertenece si es "Todos" */}
                {!selectedForoId && (
                  <Text className="text-xs text-gray-500 ml-2">
                    en{" "}
                    {foros.find((f) => f._id === comment.idForo)?.title ||
                      "un Foro"}
                  </Text>
                )}
              </View>
              {/* Contenido del comentario */}
              <Text className="text-base text-gray-800 ml-11 mt-1">
                {comment.content}
              </Text>
              <Text className="text-xs text-gray-400 text-right mt-1">
                {new Date(comment.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          );
        })}
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
              <Ionicons name="send" size={20} color="white" />
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
