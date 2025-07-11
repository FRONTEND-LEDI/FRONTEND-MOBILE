import { authContext } from "@/app/context/authContext";
import { useContext } from "react";
import { Button, Image, ScrollView, Text, View } from "react-native";

export default function Profile() {
  const { logout } = useContext(authContext);

  // Datos de ejemplo, reemplaza por datos reales del usuario si los tienes
  const user = {
    name: "Nombre Apellido",
    email: "usuario@email.com",
    avatar:
      "https://ui-avatars.com/api/?name=Nombre+Apellido&background=007bff&color=fff&size=128",
    bio: "Esta es una breve biografía del usuario. Puedes personalizar este texto.",
  };

  return (
    <ScrollView className="flex-1 bg-light px-6 pt-10 pb-4">
      <View className="items-center mb-6">
        <Image
          source={{ uri: user.avatar }}
          className="w-32 h-32 rounded-full mb-4 bg-secondary"
        />
        <Text className="text-2xl font-bold text-primary mb-1">
          {user.name}
        </Text>
        <Text className="text-base text-dark mb-2">{user.email}</Text>
        <Text className="text-dark italic text-center mb-4">{user.bio}</Text>
      </View>
      <View className="bg-white rounded-lg p-4">
        <Text className="text-lg font-bold text-primary mb-2">
          Configuración
        </Text>
        <Button title="Editar perfil" color="#a7c257" onPress={() => {}} />
        <View className="h-2" />
        <Button title="Cerrar sesión" color="#d9534f" onPress={logout} />
      </View>
    </ScrollView>
  );
}

/* const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#007bff",
  },
});
 */
