import { Comentario, Foro } from "@/types/club";
import React from "react";
import { Text, View } from "react-native";

const DisplayedComment = React.memo(
  ({ comment, foros }: { comment: Comentario; foros: Foro[] }) => {
    DisplayedComment.displayName = "DisplayedComment";
    const userName =
      typeof comment.idUser === "string"
        ? "Usuario"
        : comment.idUser.userName || "Usuario";

    const isGeneralView = !foros.some((f) => f._id === comment.idForo);
    const foroTitle = foros.find((f) => f._id === comment.idForo)?.title || "";

    const getInitials = (name: string) => name.charAt(0).toUpperCase();

    return (
      <View
        key={comment._id || Math.random()}
        className="bg-orange-100 p-3 rounded-xl mb-3 border border-orange-300 shadow-2xl w-full self-center min-h-28"
      >
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
            <Text className="text-xs text-gray-500 ml-2">{foroTitle}</Text>
          )}
        </View>
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

export default DisplayedComment;
