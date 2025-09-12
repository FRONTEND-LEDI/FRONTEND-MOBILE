import Logo from "@/assets/images/avatar-con-anteojos.png";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react"; // Añade useEffect
import {
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import {
  AvatarResponse,
  SignUpApi,
  getAvatar,
  getCategories,
} from "../api/auth";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
    lastName: "",
    birthDate: new Date(),
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [avatars, setAvatars] = useState<AvatarResponse[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarResponse | null>(
    null
  );
  const pagerRef = useRef<PagerView>(null);
  const [step, setStep] = useState(0);
  const router = useRouter();
  const [dotAnimations] = useState([
    new Animated.Value(1),
    new Animated.Value(1),

    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1)
  ]);

  // Efecto para cargar categorías cuando se monta el componente
  useEffect(() => {
    loadCategories();
    loadAvatars();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      Alert.alert("Error", "No se pudieron cargar las categorías");
    } finally {
      setLoadingCategories(false);
    }
  };
  const loadAvatars = async () => {
    try {
      setLoadingAvatars(true);
      const avatarsData = await getAvatar();

      setAvatars(avatarsData);
    } catch (error) {
      console.error("Error al cargar avatares:", error);
      Alert.alert("Error", "No se pudieron cargar los avatares");
    } finally {
      setLoadingAvatars(false);
    }
  };
  const handleChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goToNextStep = () => {
    if (pagerRef.current) {
      pagerRef.current.setPage(step + 1);
    }
  };

  const goToPreviousStep = () => {
    if (pagerRef.current && step > 0) {
      pagerRef.current.setPage(step - 1);
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

  const handleSelectInterest = (category: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(category)) {
        // Si ya está seleccionada, la quitamos
        return prev.filter((item) => item !== category);
      } else {
        // Si no está seleccionada, la añadimos
        return [...prev, category];
      }
    });
  };
  const handleSelectedAvatar = (avatar: AvatarResponse) => {
    setSelectedAvatar(avatar);
  };

  const handleRegister = async () => {
    try {
      const { username, name, lastName, birthDate, email, password } = formData;

      const formattedDate = birthDate.toISOString().split("T")[0];
      const avatarId = selectedAvatar ? selectedAvatar._id : "";
      const res = await SignUpApi(
        username,
        name,
        lastName,
        formattedDate,
        email,
        password,
        selectedInterests,
        avatarId
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
      {[0, 1, 2, 3].map(
        (
          index // Añade el cuarto paso
        ) => (
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
        )
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={goToPreviousStep}
            className="w-[48%] bg-gray-200 py-4 rounded-xl"
          >
            <Text className="text-gray-700 text-center font-semibold text-base">
              Atrás
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToNextStep}
            className="w-[48%] bg-primary py-4 rounded-xl"
          >
            <Text className="text-white text-center font-semibold text-base">
              Siguiente
            </Text>
          </TouchableOpacity>
        </View>

        {renderProgressDots()}
      </View>
      {/* Paso 3: Elección de intereses */}
      <View key="3" className="flex-1 bg-white justify-center px-6 py-8">
        <View className="items-center mb-6">
          <Logo width={100} height={100} />
        </View>
        <Text className="text-3xl font-bold text-center mb-2 text-primary opacity-80">
          Elige tus intereses
        </Text>
        <Text className="text-gray-500 text-center mb-6 text-base">
          Selecciona las categorías que más te interesan
        </Text>

        {loadingCategories ? (
          <Text className="text-center text-gray-500">
            Cargando categorías...
          </Text>
        ) : (
          <>
            <View className="flex-row flex-wrap justify-center mb-6">
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={`category-${index}-${category}`}
                  onPress={() => handleSelectInterest(category)}
                  className={`m-1 px-4 py-2 border rounded-full ${
                    selectedInterests.includes(category)
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={
                      selectedInterests.includes(category)
                        ? "text-white"
                        : "text-gray-700"
                    }
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={goToPreviousStep}
                className="w-[48%] bg-gray-200 py-4 rounded-xl"
              >
                <Text className="text-gray-700 text-center font-semibold text-base">
                  Atrás
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToNextStep}
                className="w-[48%] bg-primary py-4 rounded-xl"
              >
                <Text className="text-white text-center font-semibold text-base">
                  Siguiente
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        {renderProgressDots()}
      </View>

      {/* Paso 4: Elección de avatar */}
      <View key="4" className="flex-1 bg-white justify-center px-6 py-8">
        <View className="items-center mb-6">
          <Logo width={100} height={100} />
        </View>
        <Text className="text-3xl font-bold text-center mb-2 text-primary opacity-80">
          Selecciona el avatar que más te guste
        </Text>
        {loadingAvatars ? (
          <Text className="text-gray-500 text-center mb-6 text-base">
            Cargando avatares...
          </Text>
        ) : (
          <View className="flex-row flex-wrap justify-center">
            {avatars.map((item) => (
              <TouchableOpacity
                key={item._id}
                onPress={() => handleSelectedAvatar(item)}
                className={`m-2 p-2 border rounded-full ${
                  selectedAvatar?._id === item._id
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-300"
                }`}
              >
                <Image
                  source={{ uri: item.avatars.url_secura }}
                  className="w-40 h-40 rounded-full"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={goToPreviousStep}
            className="w-[48%] bg-gray-200 py-4 rounded-xl"
          >
            <Text className="text-gray-700 text-center font-semibold text-base">
              Atrás
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRegister}
            className="w-[48%] bg-primary py-4 rounded-xl"
            disabled={selectedInterests.length === 0}
          >
            <Text className="text-white text-center font-semibold text-base">
              Finalizar
            </Text>
          </TouchableOpacity>
        </View>
        {renderProgressDots()}
      </View>
    </PagerView>
  );
}
