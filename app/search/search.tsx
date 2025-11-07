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
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!searchQuery.trim()) {
        setData([]);
        setShowRecommended(true);
        return;
      }
      
      setIsLoading(true);
      setShowRecommended(false);
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
        <Text className="text-red-500 font-medium">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
    
      <View className="px-5 pt-2 pb-4 bg-white shadow-sm" >
        <Text className="text-2xl font-bold text-primary m-4">Buscar</Text>
        
        
        <View 
          className={`flex-row items-center bg-gray-100 rounded-2xl px-4 py-1 ${
            isFocused ? 'border-2 border-primary' : 'border-2 border-transparent'
          }`}
          style={{
            shadowColor: isFocused ? '#D97706' : '#000',
            shadowOffset: { width: 0, height: isFocused ? 4 : 2 },
            shadowOpacity: isFocused ? 0.15 : 0.05,
            shadowRadius: isFocused ? 8 : 3,
            elevation: isFocused ? 4 : 1,
          }}
        >
          <MaterialIcons 
            name="search" 
            size={24} 
            color={isFocused ? "#D97706" : "#9CA3AF"} 
          />
          <TextInput
            placeholder="Busca tu próximo libro..."
            placeholderTextColor="#9CA3AF"
            clearButtonMode="always"
            className="flex-1 px-3 py-3 text-base text-gray-800"
            autoCapitalize="none"
            autoCorrect={false}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1 px-5">
        {/* Indicador de carga */}
        {isLoading && (
          <View className="mt-8">
            <ActivityIndicator size="large" color="#D97706" />
            <Text className="text-center text-gray-500 mt-2">Buscando...</Text>
          </View>
        )}

        {/* Sección de recomendados */}
        {showRecommended && recommended.length > 0 && !isLoading && (
          <View className="mt-6">
            <View className="flex-row items-center mb-4">
              <MaterialIcons name="auto-awesome" size={20} color="#D97706" />
              <Text className="text-lg font-bold ml-2 text-gray-800">
                Te podría interesar
              </Text>
            </View>
            <FlatList
              data={recommended}
              keyExtractor={(book) => book._id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  className="flex-row items-center bg-white rounded-2xl p-3 mb-3 shadow-sm" 
                  onPress={() => router.push(`../(tabs)/catalogue/${item._id}`)}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Image
                    source={{ uri: item.bookCoverImage?.url_secura }}
                    className="w-16 h-24 rounded-xl"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 3,
                    }}
                  />
                  <View className="flex-1 ml-4">
                    <Text className="font-bold text-gray-800 text-base" numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {item.author[0].fullName}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Lista de resultados de búsqueda */}
        {!showRecommended && !isLoading && (
          <FlatList
            data={data} 
            keyExtractor={(book) => book._id}
            contentContainerStyle={{ paddingTop: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="flex-row items-center bg-white rounded-2xl p-3 mb-3 shadow-sm" 
                onPress={() => router.push(`../(tabs)/catalogue/${item._id}`)}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Image
                  source={{ uri: item.bookCoverImage?.url_secura }}
                  className="w-16 h-24 rounded-xl"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                  }}
                />
                <View className="flex-1 ml-4">
                  <Text className="font-bold text-gray-800 text-base" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    {item.author[0].fullName}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              searchQuery.trim() !== "" ? (
                <View className="items-center justify-center py-12">
                  <MaterialIcons name="search-off" size={64} color="#D1D5DB" />
                  <Text className="mt-4 text-center text-gray-500 text-base">
                    No se encontraron resultados
                  </Text>
                  <Text className="mt-1 text-center text-gray-400 text-sm">
                    Intenta con otros términos de búsqueda
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}