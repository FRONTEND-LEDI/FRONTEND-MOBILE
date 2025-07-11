import { authContext } from "@/app/context/authContext";
import { useContext } from "react";
import { Button, ScrollView, Text, View } from "react-native";

export default function Home() {
  const { logout } = useContext(authContext);

  return (
    <ScrollView className="flex-1 bg-light px-6 pt-10 pb-4">
      <Text className="text-2xl font-bold text-primary mb-2">
        Bienvenido a la Home
      </Text>
      <Text className="text-base text-dark mb-6 text-center">
        Aquí puedes ver información general, accesos rápidos y novedades.
      </Text>

      {/* Sección de accesos rápidos */}
      <View className="bg-secondary rounded-lg p-4 mb-6">
        <Text className="text-lg font-bold text-primary mb-2">
          Accesos rápidos
        </Text>
        <View className="flex-row justify-between gap-2">
          <Button title="Catálogo" color="#f29200" onPress={() => {}} />
          <Button title="Club" color="#a7c257" onPress={() => {}} />
          <Button title="Perfil" color="#131313" onPress={() => {}} />
        </View>
      </View>

      {/* Sección de novedades */}
      <View className="bg-white rounded-lg p-4 mb-6">
        <Text className="text-lg font-bold text-primary mb-2">Novedades</Text>
        <Text className="text-dark italic">
          Próximamente verás aquí las últimas noticias y actualizaciones.
        </Text>
      </View>

      {/* Botón de logout */}
      <View className="bg-white rounded-lg p-4">
        <Button title="Cerrar sesión" color="#d9534f" onPress={logout} />
      </View>
    </ScrollView>
  );
}
/* 
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    width: "100%",
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#007bff",
  },
  quickLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  newsText: {
    color: "#888",
    fontStyle: "italic",
  },
});
 */