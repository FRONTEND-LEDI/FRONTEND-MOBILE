import Logo from "@/assets/images/avatar-con-anteojos.png";
import { URI } from "@/constants/ip";
import { useRouter } from "expo-router";
import * as SecureStorage from "expo-secure-store";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SignInApi } from "../api/auth";
import { authContext } from "../context/authContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { setIsLogin } = useContext(authContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    setIsSigningIn(true);
    try {
      const res = await SignInApi(email, password);
      if (!res?.token) {
        Alert.alert("Error de acceso", res?.msg || "Credenciales incorrectas.");
        return;
      }

      await SecureStorage.setItemAsync("token", res.token);
      const userReq = await fetch(`http://${URI}/getUser`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${res.token}`,
        },
      });

      if (!userReq.ok) {
        throw new Error("No se pudo obtener la información del usuario.");
      }

      const userRes = await userReq.json();
      console.log("userRes", userRes);
      setIsLogin(true);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error en el login:", error);
      Alert.alert(
        "Error",
        "No se pudo conectar con el servidor. Inténtalo nuevamente."
      );
      await SecureStorage.deleteItemAsync("token");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="flex-1 justify-center items-center p-6 bg-white"
            accessible={true}
            accessibilityLabel="Pantalla de inicio de sesión"
          >
            <Image
              source={Logo}
              className="w-32 h-32 rounded-full border-2 border-primary "
              accessibilityLabel="Logo de la aplicación"
              accessible={true}
            />
            <Text
              className="text-3xl font-extrabold text-primary mt-4"
              accessibilityRole="header"
            >
              Iniciar sesión
            </Text>
            <Text
              className="text-lg text-gray-500 mb-6"
              accessibilityLabel="¡Nos alegra verte otra vez!"
            >
              ¡Nos alegra verte otra vez!
            </Text>
            <TextInput
              className="w-full h-14 border-[1px] border-secondary rounded-xl px-4 mb-4 bg-white text-base text-gray-700 shadow"
              placeholder="Correo electrónico"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              accessible={true}
              accessibilityLabel="Campo de correo electrónico"
              accessibilityHint="Ingresá tu dirección de correo electrónico"
              accessibilityRole="text"
            />
            <TextInput
              className="w-full h-14 border-[1px] border-secondary rounded-xl px-4 mb-6 bg-white text-base text-gray-700"
              placeholder="Contraseña"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoComplete="password"
              accessible={true}
              accessibilityLabel="Campo de contraseña"
              accessibilityHint="Ingresá tu contraseña"
              accessibilityRole="text"
            />
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isSigningIn}
              className="w-full h-14 rounded-xl bg-primary flex justify-center items-center mb-4"
              accessibilityRole="button"
              accessibilityLabel="Botón Ingresar"
              accessibilityHint="Inicia sesión con los datos ingresados"
              accessibilityState={{ disabled: isSigningIn }}
            >
              {isSigningIn ? (
                <ActivityIndicator
                  color="#fff"
                  accessibilityLabel="Iniciando sesión..."
                />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Ingresar
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("./signup")}
              className="flex-row"
              accessibilityRole="link"
              accessibilityLabel="Crear cuenta"
              accessibilityHint="Navega a la pantalla para crear una nueva cuenta"
            >
              <Text className="text-base text-gray-500">
                ¿Aún no tienes cuenta?
              </Text>
              <Text className="text-base text-primary font-bold ml-1">
                Crear una ahora
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
