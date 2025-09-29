import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
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
import TopicCard from "../../../components/club/TopicCard";

const URL = `http://${IP_ADDRESS}:3402`;
let socket: Socket;

type Foro = {
  _id: string;
  title: string;
  description: string;
};

// Tipo Comentario actualizado para incluir datos de usuario
type Comentario = {
  // Asumo que tu base de datos devuelve _id o idComent
  _id?: string;
  idComent?: string;
  idForo: string;
  idUser: string;
  // Añadimos los campos que enviaremos para que se guarden
  userName: string;
  userAvatar?: string;
  content: string;
};

export default function Forum() {
  const [foros, setForos] = useState<Foro[]>([]);
  // Almacenamos todos los comentarios brutos que llegan del BE
  const [rawComentarios, setRawComentarios] = useState<Comentario[]>([]);
  // Almacenamos los comentarios que se muestran (filtrados)
  const [displayedComentarios, setDisplayedComentarios] = useState<
    Comentario[]
  >([]);

  const [selectedForoId, setSelectedForoId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  // Asumo que 'user' contiene 'id' y 'name'
  const { user } = useContext(authContext);

  /**
   * Filtra los comentarios brutos basados en el foro seleccionado.
   */
  useEffect(() => {
    if (selectedForoId) {
      // Filtrar solo los comentarios que pertenecen al foro seleccionado
      const filtered = rawComentarios.filter(
        (c) => c.idForo === selectedForoId
      );
      setDisplayedComentarios(filtered.reverse());
    } else {
      // Mostrar todos si no hay foro seleccionado
      setDisplayedComentarios(rawComentarios.reverse());
    }
    // Ordenamos por fecha de creación (si _id/idComent es un ObjectId o similar)
    // El .reverse() inicial asume que la base de datos devuelve el más viejo primero.
  }, [selectedForoId, rawComentarios]);

  useEffect(() => {
    socket = io(URL);
    console.log("Pantalla concentrada...");

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server!");
      socket.emit("get-all-foros");
      // Al conectarse, pide el historial completo de comentarios
      socket.emit("all-public");
    });

    socket.on("all-foros", (data: Foro[]) => {
      console.log("Received foros:", data);
      setForos(data);
    });

    // CORREGIDO: Listener para el historial de comentarios (Responde a 'all-public' con evento 'coments')
    socket.on("coments", (data: Comentario[]) => {
      console.log(
        "Recibidos todos los comentarios para filtrado:",
        data.length
      );
      // Guardamos la lista completa de comentarios
      setRawComentarios(data);
    });

    // CORREGIDO: Listener para nuevos comentarios en tiempo real (Evento emitido por el BE: 'coment-created')
    socket.on("coment-created", (data: Comentario) => {
      console.log("Comentario creado en tiempo real: ", data);

      // Añadimos el nuevo comentario a la lista bruta (esto disparará el useEffect de filtrado)
      setRawComentarios((prevComentarios) => [...prevComentarios, data]);

      // Nota: Dado que el BE tiene un listener duplicado para "new-public",
      // es posible que este evento se dispare dos veces.
    });

    socket.on("error", (error: { msg: string }) => {
      console.error("Socket.IO error:", error.msg);
    });

    return () => {
      // Limpiar todos los listeners
      socket.off("connect");
      socket.off("all-foros");
      socket.off("coments");
      socket.off("coment-created");
      socket.off("error");
      socket.disconnect();
      console.log("Disconnecting socket");
    };
  }, []); // Dependencia vacía: Solo se ejecuta al montar/desmontar

  const handleTopicPress = (foroId: string) => {
    // 1. Establece el foro seleccionado para que se active el filtro
    setSelectedForoId(foroId);
    // 2. Dado que el BE no tiene un endpoint específico para el historial de un foro,
    // debemos forzar una nueva petición de TODOS los comentarios.
    // Aunque es ineficiente, es la única manera de actualizar la lista.
    socket.emit("all-public");
  };

  const handleGetAllComments = () => {
    setSelectedForoId(null);
    socket.emit("all-public");
  };

  const handleSendComment = () => {
    if (selectedForoId && newComment.trim()) {
      // **Añadimos la información del usuario que quieres guardar y mostrar**
      const commentData: Comentario = {
        idForo: selectedForoId,
        idUser: user?.id || "anonymous_user",
        userName: user?.name || "Usuario Anónimo",
        userAvatar: (user as any)?.avatarUrl || "",
        content: newComment,
      };
      // Aquí se activa el BE, guarda el comentario y hace io.emit("coment-created", result)
      socket.emit("new-public", commentData);
      setNewComment("");
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-light">
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
          <TouchableOpacity key="get-all" onPress={handleGetAllComments}>
            <TopicCard
              title="GETALL"
              color={colors.secondary}
              description="Trae todos"
            />
          </TouchableOpacity>

          {foros.map((item) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => handleTopicPress(item._id)}
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

        {/* LISTA DE COMENTARIOS FILTRADOS Y ENRIQUECIDOS */}
        {displayedComentarios.map((comment) => (
          <View
            key={comment.idComent || comment._id || Math.random()} // Usamos _id o idComent como clave
            className="bg-orange-100 p-3 rounded-lg mb-2 border border-orange-200 shadow-sm"
          >
            {/* Display de Nombre y Avatar */}
            <View className="flex-row items-center mb-1">
              {/* Placeholder de Avatar */}
              <View className="w-6 h-6 rounded-full bg-orange-500 items-center justify-center mr-2">
                <Text className="text-xs text-white font-bold">
                  {comment.userName ? comment.userName[0].toUpperCase() : "U"}
                </Text>
              </View>
              {/* Nombre del Usuario */}
              <Text className="text-sm font-semibold text-orange-800">
                {comment.userName || "Usuario Desconocido"}
              </Text>
            </View>
            {/* Contenido del comentario */}
            <Text className="text-base text-gray-800 ml-8">
              {comment.content}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input de Comentario */}
      {selectedForoId ? (
        <View className="p-4">
          <View className="flex-row items-center bg-gray-100 rounded-full border border-gray-300 p-1 shadow-md">
            <TextInput
              className="flex-1 h-10 px-4 py-1 text-base text-gray-800"
              placeholder="Escribe tu comentario..."
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
