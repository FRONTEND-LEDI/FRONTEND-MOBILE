import { getBooks, getBooksByFiltering } from "@/app/api/catalogue";
import { getFormats, getSubgenres, getYears } from "@/app/api/types";
import Header from "@/components/Header";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BookCard from "./components/BookCard";
import ButtonFilter from "./components/ButtonFilter";

export default function Products() {
  const router = useRouter();

  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [subgenres, setSubgenres] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [yearBook, setYearBook] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

 
  const [filters, setFilters] = useState({
    subgenre: [],
    format: [],
    yearBook: [],
  });

  // Contador de filtros activos
  const activeFiltersCount = Object.values(filters).filter(
    (filter) => filter.length > 0
  ).length;

  // Obtener Subgéneros
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await getSubgenres();
        setSubgenres(response);
      } catch (error) {
        console.log("Error al obtener subgéneros:", error);
      }
    };
    getData();
  }, []);

  // Obtener Formatos
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await getFormats();
        setFormats(response);
      } catch (error) {
        console.log("Error al obtener formatos:", error);
      }
    };
    getData();
  }, []);

  // Obtener Años
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await getYears();
        setYearBook(response);
      } catch (error) {
        console.log("Error al obtener años:", error);
      }
    };
    getData();
  }, []);

  // Obtener Libros
  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const response = await getBooks();
        setBooks(response);
        setFilteredBooks(response);
      } catch (error) {
        console.log("Error al obtener libros:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  // Aplicar Filtros
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setIsFiltering(true);
        const response = await getBooksByFiltering(filters);
        setFilteredBooks(response);
      } catch (error) {
        console.error("Error al aplicar filtros:", error);
      } finally {
        setIsFiltering(false);
      }
    };
    applyFilters();
  }, [filters]);

  // Actualizar Filtros
  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value ? [value] : [],
    }));
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setFilters({
     
      subgenre: [],
      format: [],
      yearBook: [],
      
    });
  };

  // Obtener el formato del libro para mostrar badge
  const getFormatIcon = (format: string) => {
    switch (format?.toLowerCase()) {
      case "ebook":
        return "menu-book";
      case "audiobook":
        return "headphones";
      case "videobook":
        return "play-circle-outline";
      default:
        return "book";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header />
      
      <View className="flex-1">
        {/* Sección de Filtros Mejorada */}
        <View className="bg-white px-6 pt-4 pb-3 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <MaterialIcons name="filter-list" size={22} color="#D97706" />
              <Text className="text-lg font-bold text-gray-800 ml-2">
                Filtros
              </Text>
              {activeFiltersCount > 0 && (
                <View className="bg-primary rounded-full px-2 py-0.5 ml-2">
                  <Text className="text-white text-xs font-bold">
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </View>
            
            {activeFiltersCount > 0 && (
              <TouchableOpacity 
                onPress={clearAllFilters}
                className="flex-row items-center"
              >
                <MaterialIcons name="clear" size={18} color="#EF4444" />
                <Text className="text-red-500 text-sm font-semibold ml-1">
                  Limpiar
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <ButtonFilter
              items={subgenres}
              placeholder="Subgénero"
              title="Seleccionar subgénero"
              onSelect={(subgenre) => handleFilterChange("subgenre", subgenre)}
            />
            <ButtonFilter
              items={formats}
              placeholder="Formato"
              title="Seleccionar formato"
              onSelect={(format) => handleFilterChange("format", format)}
            />
            <ButtonFilter
              items={yearBook}
              placeholder="Año"
              title="Seleccionar año"
              onSelect={(year) => handleFilterChange("yearBook", year)}
            />
          </ScrollView>
        </View>

        {/* Información de resultados */}
        <View className="px-6 py-3 bg-gray-50">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">
              {isFiltering ? (
                "Aplicando filtros..."
              ) : (
                <>
                  <Text className="font-bold text-gray-800">
                    {filteredBooks.length}
                  </Text>
                  {" "}
                  {filteredBooks.length === 1 ? "libro encontrado" : "libros encontrados"}
                </>
              )}
            </Text>
            
            {/* Opcional: Agregar orden */}
            {/* <TouchableOpacity className="flex-row items-center">
              <MaterialIcons name="sort" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">Ordenar</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Catálogo */}
        <View className="flex-1 px-6">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#D97706" />
              <Text className="text-gray-500 mt-3">Cargando catálogo...</Text>
            </View>
          ) : filteredBooks.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <View className="bg-white rounded-3xl p-8 items-center shadow-sm">
                <MaterialIcons name="search-off" size={64} color="#D1D5DB" />
                <Text className="mt-4 text-center text-gray-800 font-bold text-lg">
                  No se encontraron libros
                </Text>
                <Text className="mt-2 text-center text-gray-500 px-4">
                  {activeFiltersCount > 0
                    ? "Intenta ajustar los filtros para ver más resultados"
                    : "No hay libros disponibles en este momento"}
                </Text>
                {activeFiltersCount > 0 && (
                  <TouchableOpacity
                    onPress={clearAllFilters}
                    className="mt-4 bg-primary px-6 py-3 rounded-xl"
                  >
                    <Text className="text-white font-bold">
                      Limpiar filtros
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <FlatList
              data={filteredBooks}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              contentContainerStyle={{ gap: 20, paddingTop: 12, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <BookCard
                  data={item}
                  onPress={() => router.push(`../catalogue/${item._id}`)}
                />
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}