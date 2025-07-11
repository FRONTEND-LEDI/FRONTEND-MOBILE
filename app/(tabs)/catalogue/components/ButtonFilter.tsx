import { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const genres = ["Accion", "Comedia", "Drama", "Terror"];

export default function GenreFilter({ onSelect }: { onSelect: (genre: string | null) => void }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const handleSelect = (genre: string | null) => {
    setSelectedGenre(genre);
    onSelect(genre);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "#fff",
          borderRadius: 999,
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          borderColor: "#D97706",
        }}
      >
        <Text style={{ fontSize: 16 }}>{selectedGenre || "Genres"}</Text>
        <Text style={{ marginLeft: 4, fontSize: 16 }}>▼</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white p-4 rounded-t-2xl max-h-[50%]">
            <Text className="text-lg font-semibold mb-2">Seleccionar género</Text>
            <FlatList
              data={["Todos", ...genres]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item === "Todos" ? null : item)}
                  className="p-3 border-b border-gray-200"
                >
                  <Text className="text-base">{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
