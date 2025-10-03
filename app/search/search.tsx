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
export default function Search() {
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BookType[]>([]);
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
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    )}

    {/* Lista de resultados */}
    <FlatList
      data={data} 
      keyExtractor={(book) => book._id}
      renderItem={({ item }) => (
        <TouchableOpacity className="flex-row items-center space-x-2 my-2" onPress={()=>router.push(`../(tabs)/catalogue/${item._id}`)}>
          <Image
            source={{ uri: item.bookCoverImage?.url_secura }}
           
            className="w-14 h-20 rounded-md"
          />
          <View className="mx-2 flex-col items-start">
          <Text className="font-bold font">{item.title}</Text>
          <Text className="text-sm">{item.author[0].name}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        !isLoading && searchQuery.trim() !== "" ? (
          <Text className="mt-4 text-center text-secondary">No se encontraron resultados</Text>
        ) : null
      }
    />
  </SafeAreaView>
);


}
