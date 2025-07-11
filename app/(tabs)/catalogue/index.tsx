import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

const mockProducts = [
  {
    id: "1",
    name: "Producto 1",
    description: "Descripción breve del producto 1",
    price: "$100",
  },
  {
    id: "2",
    name: "Producto 2",
    description: "Descripción breve del producto 2",
    price: "$200",
  },
  {
    id: "3",
    name: "Producto 3",
    description: "Descripción breve del producto 3",
    price: "$300",
  },
];

export default function Catalogue() {
  const [search, setSearch] = useState("");

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Catálogo</Text>
      <Text style={styles.subtitle}>
        Explora los productos disponibles y encuentra lo que necesitas.
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar productos..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productDesc}>{item.description}</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron productos.</Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  searchInput: {
    width: "100%",
    height: 44,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  card: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 4,
  },
  productDesc: {
    color: "#666",
    marginBottom: 8,
  },
  productPrice: {
    color: "#28a745",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 24,
  },
});
