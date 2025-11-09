import { CustomTabBar } from "@/components/CustomTabBar";
import IAFAB from "@/components/IAFAB";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useSegments } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function TabsLayout() {
  const segments = useSegments() as string[];

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
          display: isChatScreen ? "none" : "flex",
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
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />{" "}
      <Tabs.Screen
        name="catalogue"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="book" size={size} color={color} />,
        }}
      />{" "}
      <Tabs.Screen
        name="IA"
        options={{
          title: "",
          tabBarIcon: () => <IAFAB />,
          tabBarButton: (props) => (
            <View style={{ top: -20, flex: 1 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={props.onPress}
              >
                <IAFAB />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      {/*       <Tabs.Screen
        name="chat/quiz"
        options={{ title: "Quiz IA", href: null, headerShown: false }}
      /> */}
      <Tabs.Screen
        name="club/index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="people" size={size} color={color} />,
        }}
      />
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
