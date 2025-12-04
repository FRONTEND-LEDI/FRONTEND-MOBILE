import colors from "@/constants/colors";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuizCompletedProps {
  score: number;
  textCompleted?: string;
  onRetry: () => void;
  onBack: () => void;
}

export const QuizCompleted = ({ score, textCompleted, onRetry, onBack }: QuizCompletedProps) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🎉</Text>
      <Text
        style={{
          fontSize: 30,
          fontWeight: "bold",
          color: "#1F2937",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        ¡Quiz Completado!
      </Text>

      {/* Mensaje personalizado del backend o local */}
      <Text
        style={{
          fontSize: 16,
          color: "#6B7280",
          marginBottom: 24,
          textAlign: "center",
          paddingHorizontal: 10,
        }}
      >
        {textCompleted || "Has llegado al final de este desafío."}
      </Text>

      <Text style={{ fontSize: 18, color: "#4B5563", marginBottom: 8 }}>Tu puntuación final:</Text>
      <Text
        style={{
          fontSize: 72,
          fontWeight: "900",
          color: colors.primary,
          marginBottom: 40,
        }}
      >
        {score}
      </Text>

      <TouchableOpacity
        onPress={onRetry}
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 40,
          paddingVertical: 16,
          borderRadius: 9999,
          width: "100%",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>Reintentar Quiz</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onBack}
        style={{
          backgroundColor: "#E5E7EB",
          paddingHorizontal: 40,
          paddingVertical: 16,
          borderRadius: 9999,
          width: "100%",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#1F2937", fontSize: 18, fontWeight: "600" }}>Volver a Libros</Text>
      </TouchableOpacity>
    </View>
  );
};
