import Logo from "@/assets/images/logosaludo.svg";
import { useRouter } from "expo-router";
import * as SecureStorage from "expo-secure-store";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
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
    setIsSigningIn(true);
    try {
      const res = await SignInApi(email, password);

      if (!res?.token) {
        Alert.alert("Error de acceso", res?.msg || "Credenciales incorrectas.");
        return;
      }

      await SecureStorage.setItemAsync("token", res.token);

      const userReq = await fetch("http://192.168.0.20:3402/getUser", {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${res.token}`,
        },
      });

      const userRes = await userReq.json();
      console.log(userRes);

      setIsLogin(true);
      router.replace("/(tabs)/home");

    } catch (error) {
      console.error("Error en el login:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor. Inténtalo nuevamente.");
      await SecureStorage.deleteItemAsync("token");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-white">

      <Logo width={150} height={150} />

      <Text className="text-3xl font-extrabold text-primary mt-4">Iniciar sesión</Text>
      <Text className="text-lg text-gray-500 mb-6">¡Nos alegra verte otra vez!</Text>

      <TextInput
        className="w-full h-14 border-[1px] border-secondary rounded-xl px-4 mb-4 bg-white text-base text-gray-700 shadow"
        placeholder="Correo electrónico"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="w-full h-14 border-[1px] border-secondary rounded-xl px-4 mb-6 bg-white text-base text-gray-700"
        placeholder="Contraseña"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isSigningIn}
        className="w-full h-14 rounded-xl bg-primary flex justify-center items-center mb-4"
      >
        {isSigningIn ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-semibold">Ingresar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("./signup")} className="flex-row">
        <Text className="text-base text-gray-500">¿Aún no tienes cuenta?</Text>
        <Text className="text-base text-primary font-bold ml-1">Crear una ahora</Text>
      </TouchableOpacity>
    </View>
  );
}
