import { CustomTabBar } from "@/components/CustomTabBar";
import IAFAB from "@/components/IAFAB"; // Asegúrate que la ruta sea correcta
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useSegments } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabsLayout() {
  const segments = useSegments() as string[];

  // Ocultamos la barra en CUALQUIER ruta dentro del grupo (IA)
  const isIAScreen = segments[0] === "(IA)";

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f5f5f5",
        tabBarInactiveTintColor: "#F8D49A",
        tabBarStyle: {
          backgroundColor: "#D97706",
          borderTopWidth: 0,
          height: 80,
          // Oculta la barra si estamos en (IA)/chat o (IA)/quiz
          display: isIAScreen ? "none" : "flex",
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      {/* Pestaña 1: Home */}
      <Tabs.Screen
        name="home/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      {/* Pestaña 2: Catalogue */}
      <Tabs.Screen
        name="catalogue"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="book" size={size} color={color} />,
        }}
      />

      {/* Pestaña 3: El FAB (Ficticio) */}
      <Tabs.Screen
        // 1. Damos un 'name' que SÍ existe (lo crearemos en el paso 2)
        name="ia_placeholder"
        options={{
          title: "",
          // 2. Reemplazamos el icono/tab con nuestro FAB (IAFAB se encargará
          //    de las acciones internas). No pasamos onPress para evitar
          //    la navegación automática.
          tabBarIcon: () => (
            <View style={{ top: -20, flex: 1, justifyContent: "center", alignItems: "center" }}>
              <IAFAB />
            </View>
          ),
        }}
      />

      {/* Pestaña 4: Club */}
      <Tabs.Screen
        name="club/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="people" size={size} color={color} />,
        }}
      />
      {/* Pestaña 5: Profile */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
