import colors from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

interface GameHeaderProps {
  points: number;
  bookTitle: string;
  lives: number;
  page: number;
  totalQuestions: number;
}

const MAX_LIVES = 2;

export const GameHeader = ({ points, bookTitle, lives, page, totalQuestions }: GameHeaderProps) => {
  const lifeIcons = [];
  for (let i = 0; i < MAX_LIVES; i++) {
    lifeIcons.push(
      <MaterialIcons
        key={i}
        name={i < lives ? "favorite" : "favorite-border"}
        size={24}
        color={i < lives ? "#EF4444" : "#D1D5DB"}
      />
    );
  }

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, color: "#9CA3AF", flex: 1 }} numberOfLines={1}>
          {bookTitle}
        </Text>
        <View style={{ flexDirection: "row", gap: 4 }}>{lifeIcons}</View>
      </View>
      <Text style={{ fontSize: 30, fontWeight: "bold", color: colors.primary }}>Puntos: {points}</Text>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#4B5563",
          marginTop: 4,
        }}
      >
        Pregunta: {page} / {totalQuestions}
      </Text>
    </View>
  );
};

export const TypewriterQuestion = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayedText("");
    setIsComplete(false);

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <View
      style={{
        backgroundColor: "#FEF3C7",
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#FDE68A",
        minHeight: 80,
      }}
    >
      <Text style={{ fontSize: 18, color: "#1F2937", lineHeight: 24 }}>
        {displayedText}
        {!isComplete && <Text style={{ fontSize: 20, color: colors.primary, marginLeft: 4 }}>▌</Text>}
      </Text>
    </View>
  );
};
