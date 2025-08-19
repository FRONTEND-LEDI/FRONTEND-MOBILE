import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterProps<T> {
  items: T[];
  placeholder?: string;
  title?: string;
  buttonStyle?: string;
  modalStyle?: string;
  onSelect: (item: T | null) => void;
}

export default function ButtonFilter<T>({
  items,
  placeholder = "Seleccionar",
  title = "Seleccionar",
  buttonStyle = "",
  modalStyle = "",
  onSelect,
}: FilterProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const handleSelect = (item: T | null) => {
    setSelectedItem(item);
    onSelect(item);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        className={`px-4 py-2 bg-secondary text-white rounded-full self-start flex-row items-center ${buttonStyle}`}
      >
        <Text className="text-semibold  text-white">
          {selectedItem ? String(selectedItem) : placeholder}
        </Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className={`flex-1 justify-end bg-black/30 ${modalStyle}`}>
          <View className="bg-white p-4 rounded-t-[20px] max-h-[50%]">
            <Text className="text-lg font-semibold mb-3">{title}</Text>
            <FlatList
              data={["Todos", ...items] as any[]}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item === "Todos" ? null : item)}
                  className="p-3 border-b border-gray-200"
                >
                  <Text className="text-base">
                    {item === "Todos" ? "Todos" : String(item)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
