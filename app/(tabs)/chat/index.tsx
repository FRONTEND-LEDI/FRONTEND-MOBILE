import { chat, memory } from "@/app/api/chat";
import { authContext } from "@/app/context/authContext";
import Header from "@/components/Header";
import { Message } from "@/types/chat";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "expo-router";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function ChatScreen() {
  const { user } = useContext(authContext);
  
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMemory, setIsLoadingMemory] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionId] = useState(generateId());

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });

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

  useEffect(() => {
    loadMemory();
  }, []);

  const loadMemory = async (refresh = false) => {
    try {
      refresh ? setIsRefreshing(true) : setIsLoadingMemory(true);
      const res = await memory(sessionId);

      if (Array.isArray(res) && res[0]?.messages?.length > 0) {
        const loaded = res[0].messages.map((m: any, i: number) => ({
          id: `m-${i}`,
          type: m.type,
          content: m.content,
          timestamp: new Date(),
          isUser: m.type === "human",
        }));
        console.log("mensaje", loaded);
        setMessages(loaded);
      } else {
        setMessages([welcomeMsg]);
      }
    } catch {
      Alert.alert("Error", "No se pudo cargar tu chat anterior");
      setMessages([welcomeMsg]);
    } finally {
      setIsLoadingMemory(false);
      setIsRefreshing(false);
    }
  };

  const welcomeMsg: Message = {
    id: "welcome",
    type: "ai",
    content: "Escribe algo para hablar con Aguarú",
    timestamp: new Date(),
    isUser: false,
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const text = inputText.trim();
    const userMessage: Message = {
      id: generateId(),
      type: "human",
      content: text,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    inputRef.current?.blur();

    try {
      console.log(text);
      const res = await Promise.race([

        chat(text, sessionId),
        new Promise((_, r) =>
          setTimeout(() => r({ message: "Timeout" }), 12000)
        ),
      ]);

      const extract = (d: any): string | null => {
        if (!d) return null;
        if (typeof d === "string") return d;
        if (typeof d === "object") {
          for (const k in d) {
            if (typeof d[k] === "string") return d[k];
          }
        }
        return null;
      };

      let botText = extract(res) || "No entendí bien. Probá otra vez.";
      console.log("b", botText);

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          type: "ai",
          content: botText,
          timestamp: new Date(),
          isUser: false,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          type: "ai",
          content: "Error al conectar con el servidor. Probá de nuevo.",
          timestamp: new Date(),
          isUser: false,
        },
      ]);

      Alert.alert(
        "Error de conexión",
        err?.message || "Error al conectar con el servidor"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (isLoadingMemory && !isRefreshing) {
    return (
      <SafeAreaView style={styles.screen}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Cargando chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadMemory(true)}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[styles.row, m.isUser ? styles.right : styles.left]}
            >
              {!m.isUser && (
                <View style={styles.avatarAI}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  m.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={m.isUser ? styles.userText : styles.aiText}>
                  {m.content}
                </Text>
                <Text style={styles.timeUser}>
                  {m.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              {m.isUser && (
                <View style={styles.avatarUser}>
                  {user?.avatar?.avatars?.url_secura ? (
                    <Image
                      source={{ uri: user.avatar.avatars.url_secura }}
                      style={styles.avatarUser} 
                      resizeMode="cover"
                    />
                  ) : (
                   
                    <View style={styles.avatarUser}>
                  <Ionicons name="person-circle" size={22} color="#fff" />
                </View>
                  )}
                </View>
              )}
            </View>
          ))}

          {isLoading && (
            <View style={[styles.row, styles.left]}>
              <View style={styles.avatarAI}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
              </View>
              <View style={[styles.bubble, styles.aiBubble]}>
                <View style={styles.typingDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            style={[
              styles.sendBtn,
              inputText.trim() && !isLoading
                ? styles.sendActive
                : styles.sendDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAFAFA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 6, color: "#555" },
  chatContainer: { padding: 16, paddingBottom: 90 },
  row: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
  right: { justifyContent: "flex-end" },
  left: { justifyContent: "flex-start" },

  avatarAI: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#D97706",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  avatarUser: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#4B5563",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#eee",
  },
  userBubble: {
    backgroundColor: "#D97706",
    borderColor: "#C66900",
  },

  aiText: { color: "#333", fontSize: 15 },
  userText: { color: "#fff", fontSize: 15 },
  time: { fontSize: 10, color: "#888", marginTop: 4, textAlign: "right" },
  timeUser: { fontSize: 10, color: "#fff", marginTop: 4, textAlign: "right" },

  typingDots: { flexDirection: "row", gap: 4 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#aaa",
    opacity: 0.8,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendActive: { backgroundColor: "#D97706" },
  sendDisabled: { backgroundColor: "#CFCFCF" },
});
