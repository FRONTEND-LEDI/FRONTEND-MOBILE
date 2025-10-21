import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export default function ChatScreen() {
  const navigation = useNavigation();

  // 🔹 Oculta la TabBar al entrar y la restaura al salir
  useFocusEffect(
    useCallback(() => {
      // Oculta la tab bar
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });

      // Restaura al salir del chat
      return () =>
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            backgroundColor: "#D97706",
            height: 90,
            borderTopWidth: 0,
          },
        });
    }, [navigation])
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! I'm processing your request...",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 flex-row ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!message.isUser && (
                <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-2">
                  <Ionicons name="chatbubble" size={16} color="white" />
                </View>
              )}

              <View
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? "bg-primary rounded-tr-sm"
                    : "bg-white rounded-tl-sm shadow-sm"
                }`}
              >
                <Text
                  className={`text-base ${
                    message.isUser ? "text-white" : "text-gray-800"
                  }`}
                >
                  {message.text}
                </Text>
                <Text
                  className={`text-xs mt-1 ${
                    message.isUser ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              {message.isUser && (
                <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center ml-2">
                  <Ionicons name="person" size={16} color="white" />
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View className="border-t border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center space-x-2">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              <TextInput
                className="flex-1 text-base text-gray-800"
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                onSubmitEditing={handleSend}
              />
            </View>

            <TouchableOpacity
              onPress={handleSend}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() ? "bg-primary" : "bg-gray-300"
              }`}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
