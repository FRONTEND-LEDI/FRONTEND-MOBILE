import ButtonTheme from "@/app/(tabs)/catalogue/components/ButtonTheme";
import { getAuthorById } from "@/app/api/author";
import {
  deleteBookProgress,
  getBookProgressById,
  postSaveProgress,
} from "@/app/api/bookProgress";
import { getBookById } from "@/app/api/catalogue";
import { AuthorType } from "@/types/author";
import { BookType, format } from "@/types/book";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
  const [status, setStatus] = useState<string>("");

  const [book, setBook] = useState<BookType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState<AuthorType | null>(null);
  useFocusEffect(
    useCallback(() => {
      const fetchBook = async () => {
        try {
          const data = await getBookById(idBook as string);
          setBook(data);

          console.log("datos del libro", data);

          const progress = await getBookProgressById(idBook as string);
          if (progress) {
            setStatus(progress.status);
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

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (newStatus === "delete") {
        await deleteBookProgress(idBook as string);
        setStatus("");
      } else {
        setStatus(newStatus);
        await postSaveProgress({
          idBook: idBook as string,
          status: newStatus,
          position: 0,
          percent: 0,
          total: 0,
          unit: "pages",
        });
      }

      console.log("Progreso actualizado correctamente", newStatus);
    } catch (error) {
      console.error("Error guardando progreso:", error);
    }
  };

  useEffect(() => {
    return () => {
      setBook(null);
      setLoading(true);
      setError(null);
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
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
            source={{ uri: book.bookCoverImage?.url_secura }}
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
              {book.author[0].fullName}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center items-center gap-4 mb-6">
          {/* Botón  Escuchar */}

          {book.format === format.BOOK && (
            <TouchableOpacity
              className="flex-row items-center justify-center px-6 py-4 rounded-full shadow-lg"
              style={{
                backgroundColor: "#D97706",
                shadowColor: "#D97706",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                minWidth: 150, // Mismo ancho mínimo
                maxWidth: 150, // Mismo ancho máximo
              }}
              onPress={() =>
                router.push({
                  pathname: `./${idBook}/read`,
                  params: { idBook },
                })
              }
            >
              <Ionicons name="book" size={16} color="#F8D49A" />
              <Text className="text-white font-semibold text-base ml-2">
                Leer
              </Text>
            </TouchableOpacity>
          )}
          {book.format === format.AUDIO && (
            <TouchableOpacity
              className="flex-row items-center justify-center px-6 py-4 rounded-full shadow-lg"
              style={{
                backgroundColor: "#D97706",
                shadowColor: "#D97706",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                minWidth: 150, // Mismo ancho mínimo
                maxWidth: 150, // Mismo ancho máximo
              }}
              onPress={() =>
                router.push({
                  pathname: `./${idBook}/watch`,
                  params: {
                    mediaSource: book.contentBook?.url_secura,
                    idBook: book.contentBook?.url_secura,
                  },
                })
              }
            >
              <MaterialIcons
                name="multitrack-audio"
                size={16}
                color="#F8D49A"
              />
              <Text className="text-white font-semibold text-base ml-2">
                Escuchar
              </Text>
            </TouchableOpacity>
          )}
          {book.format === format.VIDEO && (
            <TouchableOpacity
              className="flex-row items-center justify-center px-6 py-4 rounded-full shadow-lg"
              style={{
                backgroundColor: "#D97706",
                shadowColor: "#D97706",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                minWidth: 150, // Mismo ancho mínimo
                maxWidth: 150, // Mismo ancho máximo
              }}
              onPress={() =>
                router.push({
                  pathname: `./${idBook}/watch`,
                  params: {
                    mediaSource: book.contentBook?.url_secura,
                    idBook: book.contentBook?.url_secura,
                  },
                })
              }
            >
              <MaterialIcons
                name="video-collection"
                size={16}
                color="#F8D49A"
              />
              <Text className="text-white font-semibold text-base ml-2">
                Ver video
              </Text>
            </TouchableOpacity>
          )}

          {/* Status select */}
          <View style={{ minWidth: 150, maxWidth: 150 }}>
            <StatusSelect value={status} onChange={handleStatusChange} />
          </View>
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
            <View className="mx-8  flex-col justify-center items-center ">
              <Text className="text-primary text-xl font-bold">
                {book.genre || "Desconocido"}
              </Text>
              <Text className="text-gray-600 font-normal">Género</Text>
            </View>
            <View className="mx-8  flex-col justify-center items-center">
              <Text className="text-primary text-xl font-bold">
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
