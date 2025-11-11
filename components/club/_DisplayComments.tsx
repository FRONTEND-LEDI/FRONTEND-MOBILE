import { authContext } from "@/app/context/authContext";
import { Comment, Foro } from "@/types/club";
import { MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Importaciones de Gesture Handler
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Socket } from "socket.io-client";

// Tipos para este componente
type Props = {
  comment: Comment;
  foros: Foro[];
  socket: Socket | null;
  // Esta función es la que llama al componente padre (Forum) para abrir el Modal
  onViewThread: (comment: Comment) => void;
};

const DisplayedComment = ({ comment, foros, socket, onViewThread }: Props) => {
  const { user } = useContext(authContext);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.content);

  // Lógica de usuario y iniciales
  const userName =
    typeof comment.idUser === "string"
      ? "Usuario"
      : comment.idUser.userName || "Usuario";
  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  // Condición para mostrar el botón de opciones (si es el dueño)
  const isCommentOwner = user?._id === comment.idUser._id;

  // --- DEFINICIÓN DE GESTOS ---

  // 1. Gesto de DOBLE TAP (Abre el Modal de Hilo)
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      // Llama a la función del componente padre
      onViewThread(comment);
    });

  // 2. Gesto de TOQUE SIMPLE (Permite que el toque simple no haga nada si hay doble tap)
  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250) // Permite toques rápidos
    .onEnd((event) => {
      // Si el doble tap no se activa, este se dispara
      // Si no está editando, podríamos usarlo para enfocar. Por ahora, solo es una capa de toque.
    });

  // 3. Gesto de TOQUE LARGO (Muestra opciones de Edición/Borrado, solo si es el dueño)
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      if (isCommentOwner) {
        setOptionsVisible(true);
      }
    });

  // 4. Gesto COMBINADO: Hace que los gestos convivan
  const combinedGesture = Gesture.Race(
    singleTapGesture, // Toca y suelta rápidamente
    longPressGesture, // Mantiene presionado
    doubleTapGesture // Doble toque
  );

  // Lógica de edición y borrado
  const handleDelete = () => {
    if (!socket) return;
    Alert.alert("Eliminar", "¿Seguro que deseas eliminar este comentario?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          socket.emit("delete-coment", comment._id);
          setOptionsVisible(false);
        },
      },
    ]);
  };

  const handleSaveEdit = () => {
    if (!socket) return;
    if (!editedText.trim()) return;

    socket.emit("update-coment", comment._id, {
      content: editedText.trim(),
    });

    setIsEditing(false);
    setOptionsVisible(false);
  };

  return (
    // 1. Envolvemos el contenido con GestureDetector
    <GestureDetector gesture={combinedGesture}>
      <View className="bg-orange-100 p-3 rounded-xl mb-3 border border-orange-300 shadow w-full">
        <View className="flex-row items-center mb-1">
          <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-3">
            <Text className="text-sm font-bold text-white">
              {getInitials(userName)}
            </Text>
          </View>
          <Text className="text-base font-semibold text-orange-800">
            {userName}
          </Text>
          {/* Botón de opciones, solo visible para el dueño */}
          {isCommentOwner && (
            <TouchableOpacity
              className="ml-auto p-1"
              onPress={() => setOptionsVisible(true)}
            >
              <SimpleLineIcons name="options-vertical" size={18} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        {/* Renderizado de edición o contenido normal */}
        {isEditing ? (
          <TextInput
            className="bg-white p-2 rounded-lg border border-gray-300"
            value={editedText}
            onChangeText={setEditedText}
            multiline
          />
        ) : (
          <Text className="text-base text-gray-800 ml-1">
            {comment.content}
          </Text>
        )}

        {/* Botones de edición */}
        {isEditing && (
          <View className="flex-row justify-end mt-2">
            <TouchableOpacity
              className="px-3 py-1 bg-gray-300 rounded-lg mr-2"
              onPress={() => setIsEditing(false)}
            >
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-3 py-1 bg-orange-500 rounded-lg"
              onPress={handleSaveEdit}
            >
              <Text className="text-white">Guardar</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text className="text-xs text-gray-400 mt-2 text-right">
          {comment.createdAt
            ? new Date(comment.createdAt).toLocaleTimeString()
            : ""}
        </Text>

        {/* Modal de opciones */}
        <Modal transparent visible={optionsVisible} animationType="fade">
          <Pressable
            className="flex-1 bg-black/40 justify-end"
            onPress={() => setOptionsVisible(false)}
          >
            <View className="bg-white rounded-t-2xl p-5">
              {/* Botón Editar */}
              <TouchableOpacity
                className="flex-row items-center mb-4"
                onPress={() => {
                  setIsEditing(true);
                  setOptionsVisible(false);
                }}
              >
                <MaterialIcons name="edit" size={22} />
                <Text className="ml-2 text-base">Editar</Text>
              </TouchableOpacity>

              {/* Botón Eliminar */}
              <TouchableOpacity
                className="flex-row items-center"
                onPress={handleDelete}
              >
                <MaterialIcons name="delete" size={22} color="red" />
                <Text className="ml-2 text-base text-red-500">Eliminar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>
    </GestureDetector>
  );
};

export default React.memo(DisplayedComment);
