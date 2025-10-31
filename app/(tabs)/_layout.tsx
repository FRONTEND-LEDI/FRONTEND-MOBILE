import chatLogo from "@/assets/images/LOGO.png";
import { CustomTabBar } from "@/components/CustomTabBar";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useSegments } from "expo-router";
import { Image } from "react-native";

export default function TabsLayout() {
  const segments = useSegments() as string[];

  // Verifica si estamos en la ruta 'chat' (que corresponde a chat/index)
  const isChatScreen = segments.includes("chat");

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
          display: isChatScreen ? "none" : "flex", // 👈 Aquí se oculta solo en chat
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Image
              source={chatLogo}
              style={{
                width: size * 1.5,
                height: size * 1.5,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="club/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}