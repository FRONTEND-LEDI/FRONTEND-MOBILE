import colors from "@/constants/colors";
import { Stack } from "expo-router";

// Este layout gestiona la navegación dentro de la pestaña 'Club' (Foros)
export default function ClubLayout() {
  return (
    <Stack>
      {/* El índice (index.tsx) es la pantalla principal del foro.
        Aquí se muestra la lista de foros y comentarios principales.
      */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Foros",
        }}
      />

      {/* La pantalla dinámica para el hilo de respuestas.
        La ruta será /club/{threadId} (ej: /club/68dfc4f16ef8cc3fe80e0631)
      */}
      <Stack.Screen
        name="[threadId]"
        options={{
          presentation: "modal", // O 'card' si prefieres que sea un push estándar
          headerTitle: "Respuestas",
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}
