import { MaterialIcons } from "@expo/vector-icons";
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
        android_ripple={{ color: "#ddd", borderless: true }}
        className={` px-3 py-2 bg-secondary rounded-full flex-row items-center justify-between shadow-sm ${buttonStyle}`}
      >
        <Text className="text-white font-medium text-center">
          {selectedItem ? String(selectedItem) : placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={20} color="white" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className={`flex-1 justify-end bg-black/30 ${modalStyle}`}>
          <View className="bg-white p-4 rounded-t-2xl max-h-[50%]">
            {/* Handle visual */}
            <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-3" />

            <Text className="text-lg font-semibold mb-3">{title}</Text>

            <FlatList
              data={["Todos", ...items] as any[]}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => {
                const isSelected =
                  (item === "Todos" && selectedItem === null) ||
                  item === selectedItem;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item === "Todos" ? null : item)}
                    className={`p-3 rounded-lg ${
                      isSelected ? "bg-gray-100" : ""
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        isSelected ? "font-semibold text-secondary" : ""
                      }`}
                    >
                      {item === "Todos" ? "Todos" : String(item)}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View className="h-2" />}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
