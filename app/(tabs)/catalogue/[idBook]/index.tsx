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
import { MaterialIcons } from "@expo/vector-icons";

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

      return () => {
        setBook(null);
        setLoading(true);
        setError(null);
      };
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
    } catch (error) {
      console.error("Error guardando progreso:", error);
    }
  };

  // Función para formatear duración en horas y minutos
  const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};


  type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

  const getFormatInfo = (): { icon: MaterialIconName; label: string; color: string } => {
  switch (book?.format) {
    case format.BOOK:
      return { icon: "book", label: "Leer", color: "#D97706" };
    case format.AUDIO:
      return { icon: "multitrack-audio", label: "Escuchar", color: "#D97706" };
    case format.VIDEO:
      return { icon: "video-collection", label: "Ver video", color: "#D97706" };
    default:
      return { icon: "book", label: "Abrir", color: "#D97706" };
  }
};

  /*useLayoutEffect(() => {
    console.log('entró', book)
    return () => {
      setBook(null);
      setLoading(true);
      setError(null);
    };
  }, []);*/

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#D97706" />
        <Text className="text-gray-500 mt-3">Cargando detalles...</Text>
      </View>
    );
  }

  if (error || !book) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text className="text-gray-800 text-lg font-bold mt-4">
          {error || "Libro no encontrado"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatInfo = getFormatInfo();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con imagen de fondo difuminada */}
        <View className="relative bg-white pb-6 shadow-md mt-0">
          <View className="absolute top-0 left-0 right-0 h-48 opacity-20">
            <Image
              source={{ uri: book.bookCoverImage?.url_secura }}
              className="w-full h-full"
              style={{ resizeMode: "cover" }}
              blurRadius={10}
            />
          </View>

          {/* Portada del libro */}
          <View className="items-center mt-8 px-6">
            <View
              className="rounded-2xl overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 15,
              }}
            >
              <Image
                source={{ uri: book.bookCoverImage?.url_secura }}
                style={{
                  width: width * 0.5,
                  height: width * 0.7,
                  resizeMode: "cover",
                }}
              />
            </View>

            
          </View>
        </View>

        {/* Información principal */}
        <View className="bg-white mx-4 mt-4 rounded-3xl p-6 shadow-sm">
          {/* Título */}
          <Text className="text-center font-bold text-2xl text-gray-800 mb-3">
            {book.title}
          </Text>

          {/* Autor con avatar */}
          <TouchableOpacity
            className="flex-row items-center justify-center mb-4"
            onPress={() =>
              router.push(`./${idBook}/author/${book.author[0]._id}`)
            }
          >
            <Image
              source={{ uri: author?.avatar.url_secura }}
              className="w-8 h-8 rounded-full mr-2 border-2 border-primary"
            />
            <Text className="text-base text-gray-600 font-medium">
              {book.author[0].fullName}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Stats rápidas */}
          <View className="flex-row justify-around py-4 border-t border-b border-gray-100">
            {book.totalPages && (
              <View className="items-center">
                <MaterialIcons name="menu-book" size={24} color="#D97706" />
                <Text className="text-gray-800 font-bold text-base mt-1">
                  {book.totalPages}
                </Text>
                <Text className="text-gray-500 text-xs">páginas</Text>
              </View>
            )}
            {book.duration && (
              <View className="items-center">
                <MaterialIcons name="access-time" size={24} color="#8B5CF6" />
                <Text className="text-gray-800 font-bold text-base mt-1">
                  {formatDuration(book.duration)}
                </Text>
                <Text className="text-gray-500 text-xs">duración</Text>
              </View>
            )}
            {book.level && (
              <View className="items-center">
                <MaterialIcons name="signal-cellular-alt" size={24} color="#10B981" />
                <Text className="text-gray-800 font-bold text-base mt-1">
                  {book.level}
                </Text>
                <Text className="text-gray-500 text-xs">nivel</Text>
              </View>
            )}
          </View>

          {/* Botones de acción */}
          <View className="flex-row justify-center items-center gap-3 mt-6">
            {/* Botón principal según formato */}
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-4 rounded-full shadow-lg"
              style={{
                backgroundColor: formatInfo.color,
                shadowColor: formatInfo.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={() => {
                if (book.format === format.BOOK) {
                  router.push({
                    pathname: `./${idBook}/read`,
                    params: { idBook },
                  });
                } else {
                  router.push({
                    pathname: `./${idBook}/watch`,
                    params: {
                      mediaSource: book.contentBook?.url_secura,
                      idBook: book.contentBook?.url_secura,
                    },
                  });
                }
              }}
            >
              <MaterialIcons name={formatInfo.icon} size={20} color="#F8D49A" />
              <Text className="text-white font-bold text-base ml-2">
                {formatInfo.label}
              </Text>
            </TouchableOpacity>

            
            <View className="flex-1">
              <StatusSelect value={status} onChange={handleStatusChange} />
            </View>
          </View>
        </View>

        {/* Sinopsis */}
        {book.synopsis && (
          <View className="bg-white mx-4 mt-4 rounded-3xl p-6 shadow-sm">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="description" size={20} color="#D97706" />
              <Text className="text-lg font-bold text-gray-800 ml-2">
                Sinopsis
              </Text>
            </View>
            <Text className="text-gray-700 text-base leading-6">
              {book.synopsis}
            </Text>
          </View>
        )}

        {/* Información detallada */}
        <View className="bg-white mx-4 mt-4 rounded-3xl p-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <MaterialIcons name="info-outline" size={20} color="#D97706" />
            <Text className="text-lg font-bold text-gray-800 ml-2">
              Detalles
            </Text>
          </View>

          <View className="space-y-3">
            {book.genre && (
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600 font-medium">Género</Text>
                <Text className="text-gray-800 font-bold">{book.genre}</Text>
              </View>
            )}
            
            {book.subgenre && book.subgenre.length > 0 && (
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600 font-medium">Subgénero</Text>
                <Text className="text-gray-800 font-bold">
                  {book.subgenre.join(", ")}
                </Text>
              </View>
            )}

            {book.yearBook && (
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600 font-medium">Año</Text>
                <Text className="text-gray-800 font-bold">
                  {book.yearBook.split("-")[0]}
                </Text>
              </View>
            )}

            {book.fileExtension && (
              <View className="flex-row justify-between items-center py-3">
                <Text className="text-gray-600 font-medium">Formato de archivo</Text>
                <Text className="text-gray-800 font-bold uppercase">
                  {book.fileExtension}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Temas */}
        {book.theme && book.theme.length > 0 && (
          <View className="bg-white mx-4 mt-4 mb-4 rounded-3xl p-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <MaterialIcons name="label-outline" size={20} color="#D97706" />
              <Text className="text-lg font-bold text-gray-800 ml-2">
                Temas principales
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {book.theme.slice(0, 1).map((item, index)=> (
                <ButtonTheme key={index} data={{ text: item }} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}