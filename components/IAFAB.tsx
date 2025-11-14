import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import chatLogo from "@/assets/images/LOGO.png";

const CHAT_SIZE = 56;
const ICON_SIZE = 24;

const IAFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  const chatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    bottom: withSpring(scale.value * (CHAT_SIZE + 15) * 1.5, {
      stiffness: 100,
      damping: 10,
    }),
    opacity: withTiming(scale.value, { duration: 200 }),
  }));

  const quizStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    bottom: withSpring(scale.value * (CHAT_SIZE + 15) * 2.5, {
      stiffness: 100,
      damping: 10,
    }),
    opacity: withTiming(scale.value, { duration: 200 }),
  }));

  const logoRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggleMenu = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      scale.value = withSpring(1);
      rotation.value = withTiming(180);
    } else {
      scale.value = withSpring(0);
      rotation.value = withTiming(0);
    }
  };
  // ... (fin animaciones) ...

  const handleNavigation = (path: string) => {
    toggleMenu();
    // Usamos rutas absolutas
    router.push(path as never);
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {/* 1. Botón 'Quiz' */}
      <Animated.View style={[quizStyle, { position: "absolute" }]}>
        <TouchableOpacity
          // RUTA CORREGIDA: Apunta a la ruta absoluta
          onPress={() => handleNavigation("/(IA)/quiz")}
          style={{
            width: CHAT_SIZE * 0.7,
            height: CHAT_SIZE * 0.7,
            borderRadius: CHAT_SIZE * 0.35,
            backgroundColor: "#FF6F00",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <MaterialCommunityIcons name="head-question-outline" size={ICON_SIZE} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* 2. Botón 'Chatbot' */}
      <Animated.View style={[chatStyle, { position: "absolute" }]}>
        <TouchableOpacity
          // RUTA CORREGIDA: Apunta a la ruta absoluta
          onPress={() => handleNavigation("/(IA)/chat")}
          style={{
            width: CHAT_SIZE * 0.7,
            height: CHAT_SIZE * 0.7,
            borderRadius: CHAT_SIZE * 0.35,
            backgroundColor: "#FF9800",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <MaterialIcons name="chat" size={ICON_SIZE} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* 3. Botón Principal (Toggle) */}
      <TouchableOpacity
        onPress={toggleMenu}
        style={{
          width: CHAT_SIZE,
          height: CHAT_SIZE,
          borderRadius: CHAT_SIZE / 2,
          backgroundColor: "#D97706",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 6,
        }}
      >
        <Animated.View style={logoRotationStyle}>
          <Image
            source={chatLogo}
            style={{
              width: ICON_SIZE * 1.5,
              height: ICON_SIZE * 1.5,
              tintColor: isOpen ? "white" : undefined,
            }}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default IAFAB;
