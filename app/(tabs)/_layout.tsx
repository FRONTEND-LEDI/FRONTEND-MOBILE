import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f5f5f5",
        tabBarInactiveTintColor: "#F8D49A",
        tabBarStyle: {
          backgroundColor: "#D97706",
          borderTopWidth: 0, // elimina la línea superior
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalogue/index"
        options={{
          title: "Catálogo",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="book" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="club/index"
        options={{
          title: "Club",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="people" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
        
    </Tabs>
  );
}
