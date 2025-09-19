"use client";

import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type StatusOption = {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  bgColor: string;
};

type StatusSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const options: StatusOption[] = [
    {
      label: "Leyendo",
      value: "reading",
      icon: "book",
      color: "#D97706",
      bgColor: "#F8D49A",
    },
    {
      label: "Leído",
      value: "finished",
      icon: "checkmark-done",
      color: "#D97706",
      bgColor: "#F8D49A",
    },
    {
      label: "Abandonado",
      value: "abandoned",
      icon: "close-circle",
      color: "#D97706",
      bgColor: "#F8D49A",
    },
    {
      label: "Pendiente",
      value: "pending",
      icon: "time",
      color: "#D97706",
      bgColor: "#F8D49A",
    },
     {
      label: "Eliminar",
      value: "delete",
      icon: "trash",
      color: "#D97706",
      bgColor: "#F8D49A",
    },

  ];

  // buscar el label actual
  const currentOption = options.find((opt) => opt.value === value);

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center justify-center px-6 py-4 rounded-full shadow-lg"
        style={{
          backgroundColor: "#D97706",
          shadowColor: "#D97706",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          minWidth: "100%", // Ocupa todo el ancho del contenedor padre
        }}
        onPress={() => setModalVisible(true)}
      >
        <View className="flex-row items-center">
          <View
            className="w-6 h-6 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: currentOption?.bgColor || "#F8D49A" }}
          >
            <Ionicons
              name={currentOption?.icon ?? "book"}
              size={14}
              color={currentOption?.color || "#D97706"}
            />
          </View>
          <Text 
            className="text-white font-semibold text-base"
            numberOfLines={1} // Evita que el texto se desborde
            ellipsizeMode="tail" // Puntos suspensivos si es muy largo
          >
            {currentOption?.label || "Mi lista"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color="#fff"
            style={{ marginLeft: 4 }}
          />
        </View>
      </TouchableOpacity>

      {/* El resto del modal permanece igual */}
      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <View className="flex-1 justify-end bg-black/60">
          <Pressable
            className="flex-1"
            onPress={() => setModalVisible(false)}
          />

          <View
            className="bg-white rounded-t-3xl shadow-2xl"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 25,
            }}
          >
            <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mt-3 mb-4" />

            <View className="px-6 pb-8">
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-2xl font-bold text-gray-900 mb-1">
                    Estado de lectura
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Selecciona el estado actual del libro
                  </Text>
                </View>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </Pressable>
              </View>

              <View className="gap-3">
                {options.map((option, index) => {
                  const selected = value === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      android_ripple={{ color: option.color + "20" }}
                      className={`flex-row items-center justify-between py-4 px-5 rounded-2xl border-2 ${
                        selected ? `border-2` : "border-gray-100 bg-gray-50/50"
                      }`}
                      style={{
                        borderColor: selected ? "#D97706" : "#F3F4F6",
                        backgroundColor: selected ? "#F8D49A" : "#FAFAFA",
                      }}
                      onPress={() => {
                        onChange(option.value);
                        setModalVisible(false);
                      }}
                    >
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                          style={{
                            backgroundColor: selected
                              ? "#D97706" + "15"
                              : "#F8D49A",
                          }}
                        >
                          <Ionicons
                            name={option.icon}
                            size={24}
                            color="#D97706"
                          />
                        </View>

                        <View className="flex-1">
                          <Text
                            className={`text-lg font-semibold ${
                              selected ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {option.label}
                          </Text>
                          <Text className="text-sm text-gray-500 mt-0.5">
                            {option.value === "reading" &&
                              "Actualmente leyendo"}
                            {option.value === "finished" && "Completado"}
                            {option.value === "abandoned" && "No terminado"}
                            {option.value === "pending" && "Por leer"}
                            {option.value === "delete" && "Eliminar de mi lista"}
                          </Text>
                        </View>
                      </View>

                      {selected && (
                        <View
                          className="w-6 h-6 rounded-full items-center justify-center"
                          style={{ backgroundColor: "#D97706" }}
                        >
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}