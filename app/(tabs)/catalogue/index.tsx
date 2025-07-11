import { getBooks } from "@/app/api/catalogue";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import BookCard from "./components/BookCard";
import GenreFilter from "./components/ButtonFilter";

export default function Products() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

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

  useEffect(() => {
    if (!selectedGenre) {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter((book) =>
        book.theme?.includes(selectedGenre)
      );
      setFilteredBooks(filtered);
    }
  }, [selectedGenre, books]);

  return (
    <>
      <Header />
      <View className="bg-white p-6 flex-1">
        <GenreFilter onSelect={setSelectedGenre} />
        {filteredBooks.length === 0 ? (
          <Text className="mt-4 text-center">No hay libros para este género</Text>
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
    </>
  );
}
