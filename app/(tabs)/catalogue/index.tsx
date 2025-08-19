import { getBooks } from "@/app/api/catalogue";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BookCard from "./components/BookCard";
import ButtonFilter from "./components/ButtonFilter";

export default function Products() {
  const genres = ["Acción", "Comedia", "Drama", "Terror"];
  const material = ["Audilibro", "Antología", "Recursos"]
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await getBooks();
        setBooks(response);
        setFilteredBooks(response);
      } catch (error) {
        console.log("Error al obtener los libros:", error);
      }
    };
    getData();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <Header />
      <View className="p-6">
        <View className="flex flex-row ">
           <ButtonFilter
        
          items={genres}
          placeholder="Géneros"
          title="Seleccionar género"
          onSelect={(genre:any) => console.log("Género seleccionado:", genre)}
          
        />
        <ButtonFilter
          items={material}
          placeholder="Obras"
          title="Seleccionar tipo de obra"
          onSelect={(genre:any) => console.log("Tipo de obra seleccionado:", genre)}
        />
        </View>
        {filteredBooks.length === 0 ? (
          <Text className="mt-4 text-center">
            No hay libros para este género
          </Text>
        ) : (
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ gap: 20, marginTop: 16 }}
            className="pb-4"
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
