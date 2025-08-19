import ButtonTheme from "@/app/(tabs)/catalogue/components/ButtonTheme";
import { getBookById } from "@/app/api/catalogue";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
export default function BookProps() {
  type Book = {
    id: string;
    title: string;
    author: string;
    bookCoverImage: {
      url_secura: string;
    };
    synopsis: string;
    description?: string;
    genre?: string;
    yearBook?: string;
    theme?: string[];
    contentBook: {
      url_secura: string;
    }
  };
  const router = useRouter();
  const { idBook } = useLocalSearchParams();
  const { width } = Dimensions.get("window");

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBookById(idBook as string);
        setBook(data);
      } catch (err) {
        console.error("Error al obtener el libro:", err);
        setError("No se pudo cargar el libro");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [idBook]);

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
        {/* Portada */}
        <View className="items-center mt-4 mb-2">
          <Image
            source={{ uri: book.bookCoverImage.url_secura }}
            style={{
              width: width * 0.4,
              height: width * 0.6,
              resizeMode: "contain",
            }}
          />
        </View>

        {/* Título y autor */}
        <Text className="text-center font-semibold text-lg">{book.title}</Text>
        <View className="flex-row justify-center items-center mt-1 mb-3">
          <Image
            source={require("@/assets/images/avatar.webp")}
            className="w-6 h-6 rounded-full mr-2"
          />
          <Text className="text-sm text-gray-700">{book.author}</Text>
        </View>

        {/* Botones */}
        <View className="flex-row justify-center gap-4 mb-4">
          <TouchableOpacity className="bg-primary px-6 py-2 rounded-full" onPress={() => router.push({
            pathname: `./${idBook}/read`,
            params: { pdfUrl: book.contentBook.url_secura },
          })}>
            <Text className="text-white font-semibold">Leer</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-primary px-6 py-2 rounded-full">
            <Text className="text-white font-semibold">Mi biblioteca</Text>
          </TouchableOpacity>
        </View>

        {/* Sobre el libro */}
        <Text className="text-base font-semibold m-2 text-center">
          Sobre {book.title}
        </Text>
        <Text className="text-gray-700 mb-4 text-center">
          {book.synopsis || "Sin descripción disponible."}
        </Text>

        

        <View className="flex-row justify-around m-7">
          <View className="items-center">
            <Text className="font-medium">{book.genre}</Text>
            <Text className="text-sm text-gray-500">Tipo de obra</Text>
          </View>
          <View className="items-center">
            <Text className="font-medium">{book.yearBook?.split("-")[0]}</Text>
            <Text className="text-sm text-gray-500">Año</Text>
          </View>
        </View>
      
        <View className="flex-row justify-center items-center m-7">
          {book.theme && book.theme.length > 0 && (
            <View className="flex-row flex-wrap justify-center gap-2 mb-4">
              {book.theme.slice(0, 3).map((item, index) => (
                <ButtonTheme key={index} data={{ text: item }} />
              ))}
            </View>
          )}
        </View>
        
      
        
      </ScrollView>
    </SafeAreaView>
  );
}
