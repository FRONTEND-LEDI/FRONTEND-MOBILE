import ButtonTheme from "@/app/(tabs)/catalogue/components/ButtonTheme";
import { getAuthorById } from "@/app/api/author";
import {
  deleteBookProgress,
  getUserProgress,
  postSaveProgress,
  updateBookProgress,
} from "@/app/api/bookProgress";
import { getBookById } from "@/app/api/catalogue";
import { authContext } from "@/app/context/authContext";
import { AuthorType } from "@/types/author";
import { BookType } from "@/types/book";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusSelect from "../components/StatusSelect";

export default function BookProps() {
  const router = useRouter();
  const { idBook } = useLocalSearchParams();
  const { width } = Dimensions.get("window");

  const [book, setBook] = useState<BookType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState<AuthorType | null>(null);
  const [status, setStatus] = useState<string>("Mi lista");
  const { user } = useContext(authContext);

  // ! Traer los datos del libro
  useFocusEffect(
    useCallback(() => {
      const fetchBook = async () => {
        try {
          const data = await getBookById(idBook as string);
          setBook(data);

          const progress = await getUserProgress();
          if (progress?.status) {
            setStatus(progress.status);
          } else {
            setStatus("unmarked");
          }
        } catch (err) {
          console.error("Error al obtener el libro:", err);
          setError("No se pudo cargar el libro");
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }, [idBook])
  );

  // ! Traer el autor
  useEffect(() => {
    const getAuthor = async () => {
      if (!book) return;
      try {
        const data = await getAuthorById(book.author[0]._id as string);
        setAuthor(data);
      } catch (error) {
        console.error("Error al obtener el autor:", error);
        setError("No se pudo cargar el autor");
      }
    };

    if (book) {
      getAuthor();
    }
  }, [book]);

  // ! Manejar el progreso del libro
  const handleStatusChange = async (newStatus: string) => {
    if (!book) return;
    try {
      if (newStatus === "unmarked") {
        await deleteBookProgress(book._id);
        setStatus("unmarked");
        return;
      }

      if (status === "unmarked") {
        await postSaveProgress(
          { idBook: book._id, status: newStatus },
          user?.id as string
        );
      } else {
        await updateBookProgress(book._id, newStatus);
      }

      setStatus(newStatus);
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
    }
  };

  // ! Reset al desmontar
  useEffect(() => {
    return () => {
      setBook(null);
      setLoading(true);
      setError(null);
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-tertiary">
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View className="flex-1 justify-center items-center bg-tertiary">
        <Text className="text-red-500 text-lg font-semibold">
          {error || "Producto no encontrado"}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Portada del libro */}
        <View className="items-center mt-6 mb-4 shadow-lg">
          <Image
            source={{ uri: book.bookCoverImage.url_secura }}
            style={{
              width: width * 0.5,
              height: width * 0.7,
              resizeMode: "contain",
              borderRadius: 10,
            }}
          />
        </View>

        {/* Título y autor */}
        <View className="items-center mb-4">
          <Text className="text-center font-bold text-2xl text-gray-800 mb-1">
            {book.title}
          </Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() =>
              router.push(`./${idBook}/author/${book.author[0]._id}`)
            }
          >
            <Image
              source={{ uri: author?.avatar.url_secura }}
              className="w-7 h-7 rounded-full mr-2"
            />
            <Text className="text-base text-gray-600 font-medium">
              {book.author[0].name}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botones de acción */}
        <View className="flex-row justify-center gap-4 mb-6">
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-full shadow-md"
            onPress={() =>
              router.push({
                pathname: `./${idBook}/read`,
                params: { idBook },
              })
            }
          >
            <Text className="text-white font-semibold text-base">Leer</Text>
          </TouchableOpacity>
          <StatusSelect value={status} onChange={handleStatusChange} />
        </View>

        {/* Sinopsis */}
        <View className="mb-6 text-center flex-col justify-center items-center">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Sobre {book.title}
          </Text>
          <Text className="text-gray-700 text-base leading-6">
            {book.synopsis || "Sin descripción disponible."}
          </Text>
        </View>

        {/* Detalles del libro */}
        <View className="mb-6">
          <View className="flex-row justify-evenly my-9">
            <View className="mx-8">
              <Text className="text-gray-800 font-semibold">
                {book.genre || "Desconocido"}
              </Text>
              <Text className="text-gray-600 font-normal">Género</Text>
            </View>
            <View className="mx-8">
              <Text className="text-gray-800 font-semibold">
                {book.yearBook?.split("-")[0] || "Desconocido"}
              </Text>
              <Text className="text-gray-600 font-normal">Año</Text>
            </View>
          </View>
        </View>

        {/* Temas */}
        {book.theme && book.theme.length > 0 && (
          <View className="mx-6 flex-col justify-center items-center">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Temas principales
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {book.theme.slice(0, 3).map((item, index) => (
                <ButtonTheme key={index} data={{ text: item }} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
