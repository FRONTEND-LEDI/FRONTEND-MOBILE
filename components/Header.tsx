import Logo from '@/assets/images/LOGO.png';
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  return (
    <View className="flex flex-row justify-between items-center rounded-bl-3xl rounded-br-3xl bg-primary py-5 px-4 w-full">
      <TouchableOpacity className="flex flex-row items-center">
        <Image source={Logo} className='w-8 h-8 rounded-2xl
        '/>
        <Text className="text-white font-bold text-base ml-2">Tintas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/search/search")}
      >
        <MaterialIcons name="manage-search" size={22} color="#F8D49A" />
      </TouchableOpacity>
    </View>
  );
}