import { getBooks, getBooksByFiltering } from "@/app/api/catalogue";
import { getFormats, getSubgenres, getYears } from "@/app/api/types";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BookCard from "./components/BookCard";
import ButtonFilter from "./components/ButtonFilter";

export default function Products() {
  const router = useRouter();

  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [subgenres, setSubgenres] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [yearBook, setYearbook] = useState<string[]>([]);
  const [filters, setFilters] = useState<{
    genre?: string[] | null;
    subgenre?: string[] | null;
    format?: string[] | null;
    yearBook?: string[] | null;
    theme?: string[] | null;
  }>({
    genre: null,
    subgenre: null,
    format: null,
    yearBook: null,
    theme: null,
  });

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
        setYearbook(response);
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
        const response = await getBooks();
        setBooks(response);
        setFilteredBooks(response);
      } catch (error) {
        console.log("Error al obtener libros:", error);
      }
    };
    getData();
  }, []);

  // Aplicar Filtros
  const applyFilters = async () => {
    try {
      const response = await getBooksByFiltering({
        genre: filters.genre ?? [],
        theme: filters.theme ?? [],
        subgenre: filters.subgenre ?? [],
        format: filters.format ?? [],
        yearBook: filters.yearBook?.map((year) => new Date(year)) ?? [],
      });
      setFilteredBooks(response);
    } catch (error) {
      console.error("Error al aplicar filtros:", error);
    }
  };

  // Actualizar Filtros
  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value ? [value] : [],
    }));
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  return (
    <SafeAreaView className="flex-1">
      <Header />
      <View className="p-6 flex-1">
        {/* Filtros */}
        <View className="flex flex-row flex-wrap gap-3 mb-4">
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
        </View>

        {/* Catálogo */}
        {filteredBooks.length === 0 ? (
          <Text className="mt-10 text-center text-gray-500 italic">
            No hay libros para los filtros seleccionados
          </Text>
        ) : (
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ gap: 20, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <BookCard
                data={item}
                onPress={() => router.push(`../catalogue/${item._id}`)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
