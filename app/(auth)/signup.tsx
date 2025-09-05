import Logo from "@/assets/images/avatar-con-anteojos.png";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { SignUpApi } from "../api/auth";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
    lastName: "",
    birthDate: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const pagerRef = useRef<PagerView>(null);
  const [step, setStep] = useState(0);
  const router = useRouter();
  const [dotAnimations] = useState([
    new Animated.Value(1),
    new Animated.Value(1),
  ]);

  const handleChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goToNextStep = () => {
    if (pagerRef.current) {
      pagerRef.current.setPage(step + 1);
    }
  };

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) handleChange("birthDate", selectedDate);
  };

  const onPageSelected = (e: any) => {
    const newStep = e.nativeEvent.position;
    setStep(newStep);

    Animated.sequence([
      Animated.timing(dotAnimations[newStep], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(dotAnimations[newStep], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (newStep !== step) {
      dotAnimations[step].setValue(1);
    }
  };

  const handleRegister = async () => {
    try {
      const { username, name, lastName, birthDate, email, password } = formData;
      const formattedDate = birthDate.toISOString().split("T")[0];

      const res = await SignUpApi(
        username,
        name,
        lastName,
        formattedDate,
        email,
        password
      );

      if (res?.result) {
        router.replace("/signin");
      } else {
        Alert.alert("Error", res?.msg || "Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      Alert.alert("Error", "Error de conexión con el servidor");
    }
  };

  const renderProgressDots = () => (
    <View className="flex-row justify-center my-4">
      {[0, 1].map((index) => (
        <Animated.View
          key={index}
          style={{
            transform: [{ scale: dotAnimations[index] }],
            width: 12,
            height: 12,
            borderRadius: 6,
            marginHorizontal: 4,
            backgroundColor: step === index ? "#f29200" : "#fcd19f",
          }}
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={onPageSelected}
        accessible={true}
        accessibilityLabel="Pantallas de registro por pasos"
      >
        {/* Paso 1: Datos personales */}
        <ScrollView
          key="1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 bg-white justify-center px-6 py-8">
            <View className="items-center mb-6">
              <Image
                source={Logo}
                className="w-32 h-32 rounded-full border-2 border-primary"
              />
            </View>
            <Text className="text-3xl font-bold text-center mb-1 text-primary opacity-80">
              Comienza ahora
            </Text>
            <Text className="text-gray-500 text-center mb-6 text-base">
              Ingresa tus datos personales
            </Text>

            <TextInput
              placeholder="Nombre"
              value={formData.name}
              placeholderTextColor="#aaa"
              onChangeText={(text) => handleChange("name", text)}
              className="w-full h-14 border-[1px] border-secondary rounded-xl px-4 mb-4 bg-white text-base text-gray-500 shadow"
            />

            <TextInput
              placeholder="Apellido"
              value={formData.lastName}
              placeholderTextColor="#aaa"
              onChangeText={(text) => handleChange("lastName", text)}
              className="w-full h-14 border-[1px] border-secondary rounded-xl px-4 mb-4 bg-white text-base text-gray-500 shadow"
            />

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="text-[#333] w-full h-14 border-[1px] border-secondary rounded-xl px-4 mb-4 justify-center bg-white "
            >
              <Text className="text-[#333]">
                {formData.birthDate.toLocaleDateString() ||
                  "Fecha de nacimiento"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={formData.birthDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={onChangeDate}
              />
            )}

            <TouchableOpacity
              onPress={goToNextStep}
              className="w-full bg-primary py-4 rounded-xl"
            >
              <Text className="text-white text-center font-semibold text-base">
                Siguiente
              </Text>
            </TouchableOpacity>

            {renderProgressDots()}
          </View>
        </ScrollView>

        {/* Paso 2: Credenciales */}
        <ScrollView
          key="2"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 bg-white justify-center px-6 py-8">
            <View className="items-center mb-6">
              <Image
                source={Logo}
                className="h-32 w-32 rounded-full border-2 border-primary"
              />
            </View>
            <Text className="text-3xl font-bold text-center mb-2 text-primary opacity-80">
              Comienza ahora
            </Text>
            <Text className="text-gray-500 text-center mb-6 text-base">
              Crea tus credenciales para acceder de forma segura
            </Text>

            <TextInput
              placeholder="Nombre de usuario"
              value={formData.username}
              placeholderTextColor="#aaa"
              onChangeText={(text) => handleChange("username", text)}
              className="w-full h-14 border-[1px] border-secondary rounded-xl px-4 mb-6 bg-white text-base text-gray-500 shadow"
            />

            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              className="w-full h-14 border-[1px] border-secondary rounded-xl px-4 mb-4 bg-white text-base text-gray-500 shadow"
            />

            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
              className="w-full h-14 border-[1px] border-secondary rounded-xl px-4 mb-6 bg-white text-base text-gray-500 shadow"
            />

            <TouchableOpacity
              onPress={handleRegister}
              className="w-full bg-primary py-4 rounded-xl"
            >
              <Text className="text-white text-center font-semibold text-base">
                Crear cuenta
              </Text>
            </TouchableOpacity>

            {renderProgressDots()}
          </View>
        </ScrollView>
      </PagerView>
    </KeyboardAvoidingView>
  );
}
