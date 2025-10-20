import chatLogo from "@/assets/images/LOGO.png";
import { CustomTabBar } from "@/components/CustomTabBar";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
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
          width: size * 1.5, // 50% más grande
          height: size * 1.5, // 50% más grande
        }} 
      />
    )
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