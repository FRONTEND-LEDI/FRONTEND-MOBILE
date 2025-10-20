import { getBySearch } from "@/app/api/catalogue";
import { BookType } from "@/types/book";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { booksbyRecomendation } from "../api/recomendations";

export default function Search() {
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BookType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recommended, setRecommended] = useState<BookType[]>([]);
  const [showRecommended, setShowRecommended] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!searchQuery.trim()) {
        setData([]);
        setShowRecommended(true); // Mostrar recomendados cuando no hay búsqueda
        return;
      }
      
      setIsLoading(true);
      setShowRecommended(false); // Ocultar recomendados durante la búsqueda
      try {
        const results = await getBySearch(searchQuery);
        setData(results);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery]);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const results = await booksbyRecomendation();
        setRecommended(results);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    fetchRecommended();
  }, []);
  
  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white m-5">
      {/* Buscador */}
      <View className="flex-row items-center border border-primary rounded-lg px-3">
        <MaterialIcons name="search" size={20} color="#D97706" />
        <TextInput
          placeholder="Buscar"
          clearButtonMode="always"
          className="flex-1 px-3 py-[10px]"
          autoCapitalize="none"
          autoCorrect={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Indicador de carga */}
      {isLoading && (
        <View className="mt-4">
          <ActivityIndicator size="large" color="#D97706" />
        </View>
      )}

      {/* Sección de recomendados */}
      {showRecommended && recommended.length > 0 && (
        <View className="mt-4">
          <Text className="text-lg font-bold mb-2 text-primary">Te podría interesar</Text>
          <FlatList
            data={recommended}
            keyExtractor={(book) => book._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="flex-row items-center space-x-2 my-2" 
                onPress={() => router.push(`../(tabs)/catalogue/${item._id}`)}
              >
                <Image
                  source={{ uri: item.bookCoverImage?.url_secura }}
                  className="w-14 h-20 rounded-md"
                />
                <View className="mx-2 flex-col items-start">
                  <Text className="font-bold font">{item.title}</Text>
                  <Text className="text-sm">{item.author[0].fullName}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Lista de resultados de búsqueda */}
      {!showRecommended && (
        <FlatList
          data={data} 
          keyExtractor={(book) => book._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="flex-row items-center space-x-2 my-2" 
              onPress={() => router.push(`../(tabs)/catalogue/${item._id}`)}
            >
              <Image
                source={{ uri: item.bookCoverImage?.url_secura }}
                className="w-14 h-20 rounded-md"
              />
              <View className="mx-2 flex-col items-start">
                <Text className="font-bold font">{item.title}</Text>
                <Text className="text-sm">{item.author[0].fullName}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !isLoading && searchQuery.trim() !== "" ? (
              <Text className="mt-4 text-center text-secondary">
                No se encontraron resultados
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}