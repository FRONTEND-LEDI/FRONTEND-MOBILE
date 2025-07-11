import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "home/index") {
            iconName = "home";
          } else if (route.name === "catalogue/index") {
            iconName = "book";
          } else if (route.name === "club/index") {
            iconName = "chatbubbles";
          } else if (route.name === "profile/index") {
            iconName = "person";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home/index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="catalogue/index" options={{ title: "Catálogo" }} />
      <Tabs.Screen name="club/index" options={{ title: "Foro" }} />
      <Tabs.Screen name="profile/index" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
