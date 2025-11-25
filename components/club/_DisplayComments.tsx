import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { Comment, Foro } from "@/types/club";
import { Ionicons, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
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
import { Socket } from "socket.io-client";

type Props = {
  comment: Comment;
  foros: Foro[];
  socket: Socket | null;
  onViewThread: (comment: Comment) => void;
};

const DisplayedComment = ({ comment, foros, socket, onViewThread }: Props) => {
  const { user } = useContext(authContext);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.content);

  const userName =
    !comment.idUser || typeof comment.idUser === "string"
      ? "Usuario"
      : comment.idUser.userName || "Usuario";
  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const isCommentOwner =
    user?._id &&
    comment.idUser &&
    typeof comment.idUser === "object" &&
    user._id === comment.idUser._id;

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
        {isCommentOwner && (
          <TouchableOpacity
            className="ml-auto p-1"
            onPress={() => setOptionsVisible(true)}
          >
            <SimpleLineIcons name="options-vertical" size={18} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <TextInput
          className="bg-white p-2 rounded-lg border border-gray-300"
          value={editedText}
          onChangeText={setEditedText}
          multiline
        />
      ) : (
        <Text className="text-base text-gray-800 ml-1">{comment.content}</Text>
      )}

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
      <View className="flex-row justify-between items-center mt-3 pt-2 border-t border-orange-200">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => onViewThread(comment)}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={colors.secondary}
          />
          <Text className="text-primary font-semibold ml-1.5">Responder</Text>
        </TouchableOpacity>
      </View>
      <Modal transparent visible={optionsVisible} animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setOptionsVisible(false)}
        >
          <View className="bg-white rounded-t-2xl p-5">
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
  );
};

export default React.memo(DisplayedComment);
