import { getBySearch } from "@/app/api/catalogue";
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
export default function Search() {
  const router = useRouter()
  type Book = {
    _id: string;
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
    };
  };
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      if (!searchQuery.trim()) {
        setData([]);
        return;
      }
      setIsLoading(true);
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
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    )}

    {/* Lista de resultados */}
    <FlatList
      data={data} 
      keyExtractor={(book) => book._id}
      renderItem={({ item }) => (
        <TouchableOpacity className="flex-row items-center space-x-2 my-2" onPress={()=>router.push(`./(tabs)/catalogue/${item._id}`)}>
          <Image
            source={{ uri: item.bookCoverImage?.url_secura }}
           
            className="w-14 h-20 rounded-md"
          />
          <View className="mx-2 flex-col items-start">
          <Text className="font-bold font">{item.title}</Text>
          <Text className="text-sm">{item.author}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        !isLoading && searchQuery.trim() !== "" ? (
          <Text className="mt-4 text-center">No se encontraron resultados</Text>
        ) : null
      }
    />
  </SafeAreaView>
);


}
