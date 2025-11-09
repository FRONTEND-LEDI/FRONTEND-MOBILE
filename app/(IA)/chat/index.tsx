import { chat, memory } from "@/app/api/chat";
import { authContext } from "@/app/context/authContext";
import Header from "@/components/Header";
import { Message } from "@/types/chat";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper para generar IDs únicos
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function ChatScreen() {
  const { user } = useContext(authContext)
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMemory, setIsLoadingMemory] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionId] = useState<string>(generateId());

  // Oculta la TabBar al entrar y la restaura al salir
  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });

      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            backgroundColor: "#D97706",
            height: 90,
            borderTopWidth: 0,
          },
        });
      };
    }, [navigation])
  );

  // Cargar memoria/historial al iniciar
  useEffect(() => {
    loadChatMemory();
  }, []);

  const loadChatMemory = async (showRefreshing: boolean = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoadingMemory(true);
      }

      const response = await memory(sessionId);
      
      if (response && response.length > 0 && response[0].messages) {
        const loadedMessages: Message[] = response[0].messages
          .filter(msg => msg.content && msg.content.trim() !== "")
          .map((msg, index) => ({
            id: `memory-${index}-${Date.now()}`,
            type: msg.type === 'human' ? 'human' : 'ai',
            content: msg.content,
            timestamp: msg.timestamp || new Date(),
            isUser: msg.type === 'human',
          }));
        
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
          return;
        }
      }

      // Mensaje de bienvenida por defecto
      setMessages([
        {
          id: "welcome",
          type: 'ai',
          content: "Escribe algo para comenzar a hablar con Aguarú",
          timestamp: new Date(),
          isUser: false,
        },
      ]);
    } catch (error) {
      console.error("Error al cargar memoria:", error);
      
      // Solo mostramos alerta si no es un error 404 (no encontrado)
      if ((error as any)?.status !== 404) {
        Alert.alert(
          "Error", 
          "No se pudo cargar el historial del chat",
          [{ text: "OK" }]
        );
      }
      
      // Mensaje de bienvenida por defecto
      setMessages([
        {
          id: "welcome",
          type: 'ai',
          content: "Escribe algo para comenzar a hablar con Aguarú",
          timestamp: new Date(),
          isUser: false,
        },
      ]);
    } finally {
      setIsLoadingMemory(false);
      setIsRefreshing(false);
    }
  };

  // Enviar mensaje
 // Enviar mensaje - Versión robusta
const handleSend = async () => {
  if (inputText.trim() === "" || isLoading) return;

  const userMessage: Message = {
    id: generateId(),
    type: 'human',
    content: inputText.trim(),
    timestamp: new Date(),
    isUser: true,
  };

  setMessages((prev) => [...prev, userMessage]);
  const messageToSend = inputText.trim();
  setInputText("");
  setIsLoading(true);
  
  inputRef.current?.blur();

  try {
    const response = await chat(messageToSend, sessionId);
    console.log("Respuesta completa del backend:", JSON.stringify(response, null, 2));

    let botText = "No pude procesar tu mensaje. Por favor, intenta nuevamente.";

    // Función helper para extraer texto de diferentes estructuras
    const extractText = (data: any): string | null => {
      if (typeof data === "string") return data;
      if (data?.text) return data.text;
      if (data?.output) return data.output;
      if (data?.message) return data.message;
      if (data?.reply) return data.reply;
      if (data?.content) return data.content;
      if (data?.response) return data.response;
      
      // Si es un array, buscar en el primer elemento
      if (Array.isArray(data) && data.length > 0) {
        return extractText(data[0]);
      }
      
      // Si es un objeto, buscar cualquier propiedad string
      if (typeof data === "object" && data !== null) {
        for (const key in data) {
          if (typeof data[key] === "string" && data[key].trim() !== "") {
            return data[key];
          }
        }
      }
      
      return null;
    };

    const extractedText = extractText(response);
    
    if (extractedText && extractedText.trim() !== "") {
      botText = extractedText;
    } else {
      console.warn("No se pudo extraer texto válido de la respuesta:", response);
      botText = "Recibí tu mensaje, pero no pude entender la respuesta del servidor.";
    }

    console.log("Texto final para mostrar:", botText);

    const botMessage: Message = {
      id: generateId(),
      type: 'ai',
      content: botText,
      timestamp: new Date(),
      isUser: false,
    };

    setMessages((prev) => [...prev, botMessage]);
  } catch (error: any) {
    console.error("Error al obtener respuesta:", error);

    const errorMessage: Message = {
      id: generateId(),
      type: 'ai',
      content: error?.message || "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.",
      timestamp: new Date(),
      isUser: false,
      isError: true,
    };

    setMessages((prev) => [...prev, errorMessage]);
    
    if (error?.status !== 404 && !error?.message?.includes("Timeout")) {
      Alert.alert(
        "Error", 
        error?.message || "No se pudo conectar con el servidor",
        [{ text: "OK" }]
      );
    }
  } finally {
    setIsLoading(false);
  }
};

  // Scroll automático mejorado
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Manejar envío con Enter
  const handleSubmitEditing = () => {
    if (inputText.trim() && !isLoading) {
      handleSend();
    }
  };

  const handleRefresh = () => {
    loadChatMemory(true);
  };

  // Loading inicial
  if (isLoadingMemory && !isRefreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D97706" />
          <Text className="mt-4 text-gray-600 text-base">Cargando chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#D97706"]}
              tintColor="#D97706"
            />
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
                <View className="w-10 h-10 rounded-full bg-amber-500 items-center justify-center mr-3 shadow-sm">
                  <Ionicons name="chatbubble-ellipses" size={20} color="white" />
                </View>
              )}

              <View
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.isUser
                    ? "bg-amber-500 rounded-tr-sm"
                    : message.isError 
                    ? "bg-red-50 border border-red-200 rounded-tl-sm"
                    : "bg-white border border-gray-100 rounded-tl-sm"
                }`}
              >
                <Text
                  className={`text-base leading-5 ${
                    message.isUser 
                      ? "text-white" 
                      : message.isError
                      ? "text-red-800"
                      : "text-gray-800"
                  }`}
                >
                  {message.content}
                </Text>
                <Text
                  className={`text-xs mt-1.5 ${
                    message.isUser 
                      ? "text-amber-100" 
                      : message.isError
                      ? "text-red-600"
                      : "text-gray-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              {message.isUser && (
                <View className="w-10 h-10 rounded-full bg-gray-600 items-center justify-center ml-3 shadow-sm">
                   { !user?.avatar && (
                     <Ionicons name="person-circle" size={20} color="white" />
                   )}

                </View>
              )}
            </View>
          ))}

          {isLoading && (
            <View className="mb-4 flex-row justify-start">
              <View className="w-10 h-10 rounded-full bg-amber-500 items-center justify-center mr-3">
                <Ionicons name="chatbubble-ellipses" size={20} color="white" />
              </View>
              <View className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                <View className="flex-row space-x-2">
                  <View className="w-2 h-2 bg-gray-400 rounded-full" />
                  <View className="w-2 h-2 bg-gray-400 rounded-full" />
                  <View className="w-2 h-2 bg-gray-400 rounded-full" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input de mensaje */}
        <View className="border-t border-gray-200 bg-white px-4 py-3 shadow-lg">
          <View className="flex-row items-center space-x-2">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2.5 border border-gray-200">
              <TextInput
                ref={inputRef}
                className="flex-1 text-base text-gray-800"
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                onSubmitEditing={handleSubmitEditing}
                editable={!isLoading}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              <Text className="text-xs text-gray-400 ml-2">
                {inputText.length}/500
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSend}
              className={`w-12 h-12 rounded-full items-center justify-center shadow-md ${
                inputText.trim() && !isLoading 
                  ? "bg-amber-500" 
                  : "bg-gray-300"
              }`}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons 
                  name="send" 
                  size={20} 
                  color="white"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}