import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";


type StatusOption = {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"]; // Use the Ionicons component's name prop type
};
type StatusSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const options: StatusOption[] = [
    { label: "Leyendo", value: "reading", icon: "book" },
    { label: "Leído", value: "finished", icon: "checkmark-done" },
    { label: "Abandonado", value: "abandoned", icon: "close-circle" },
    { label: "Pendiente", value: "pending", icon: "time" },
  ];

  return (
    <>
      {/* Botón que abre el modal */}
      <TouchableOpacity
        className="bg-primary px-6 py-3 rounded-full shadow-lg active:opacity-80"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white font-semibold text-base">
          {value || "Seleccionar estado"}
        </Text>
      </TouchableOpacity>

      {/* Modal para seleccionar estado */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white rounded-3xl  w-full max-w-sm shadow-2xl p-6">
            {/* Header del modal */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-primary">
                Agregar a mi lista
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                className="p-2 rounded-full hover:bg-gray-100 active:opacity-70"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

      
            {/* Opciones */}
            <View className="gap-3">
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  android_ripple={{ color: "#f0f0f0" }}
                  className={`flex-row items-center justify-between py-3 px-4 rounded-xl border ${
                    value === option.label
                      ? "border-primary bg-primary/10"
                      : "border-gray-200"
                  }`}
                  onPress={() => {
                    onChange(option.label);
                    setModalVisible(false);
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={value === option.label ? "#D97706" : "#6b7280"}
                    />
                    <Text
                      className={`text-base font-medium ${
                        value === option.label
                          ? "text-primary font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {value === option.label && (
                    <Ionicons name="checkmark" size={20} color="#D97706" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
