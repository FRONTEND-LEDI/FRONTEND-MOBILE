import Logo from "@/assets/images/logo.svg";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-4 bg-primary"
      style={{ paddingTop: insets.top + 8, paddingBottom: 12, height: 80 }}
    >
      <TouchableOpacity className="flex-row items-center">
        <Logo width={28} height={28} />
        <Text className="text-white font-bold text-base ml-2">
          Tintas
        </Text>
      </TouchableOpacity>
      <View className="flex-row space-x-4">
        <MaterialIcons name="manage-search" size={22} color="#F8D49A" />
      </View>
    </View>
  );
}
