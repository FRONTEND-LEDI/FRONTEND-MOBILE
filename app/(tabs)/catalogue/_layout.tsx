import { Stack } from "expo-router";

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen 
      name="index" 
      options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="[idBook]/index"
        options={{
          title: "Sobre el libro",
          headerStyle: {
            backgroundColor: "#D97706",
          },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}
