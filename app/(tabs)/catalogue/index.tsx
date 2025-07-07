import { getBooks } from "@/app/api/catalogue";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import BookCard from "./components/BookCard";

export default function Products() {
  
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await getBooks();
        setBooks(response);
      } catch (error) {
        console.log("Error al obtener los libros:", error); 
      }
    };
    getData();
  }, []);

  return (
    <>
      <Header />
      <View />
      <View className="bg-white p-6 flex-1">
        <FlatList
          data={books}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ gap: 20 }}
          className="pb-4"
          renderItem={({ item }) => (
            <BookCard
              data={item}
              onPress={() => router.push(`../catalogue/${item._id}`)}
            />
          )}
        />
      </View>
    </>
  );
}
