import type { BookType } from "@/types/book"
import { MaterialIcons } from "@expo/vector-icons"
import { Image, TouchableOpacity, View } from "react-native"

type BookCardProps = {
  data: BookType
  onPress: () => void
}

const getIconByFormat = (format?: string) => {
  switch (format) {
    case "ebook":
      return {
        name: "book" as keyof typeof MaterialIcons.glyphMap,
        color: "#D97706",
       
      }
    case "audiobook":
      return {
        name: "headphones" as keyof typeof MaterialIcons.glyphMap,
        color: "#D97706",
       
      }
    case "videobook":
      return {
        name: "play-circle-filled" as keyof typeof MaterialIcons.glyphMap,
        color: "#D97706",
       
      }
    default:
      return {
        name: "description" as keyof typeof MaterialIcons.glyphMap,
        color: "#D97706",
       
      }
  }
}

export default function BookCard({ data, onPress }: BookCardProps) {
  const iconConfig = getIconByFormat(data.format)

  return (
    <TouchableOpacity className="w-[48%] items-center bg-fifth rounded-xl overflow-hidden shadow-md" onPress={onPress}>
      <View className="relative w-full">
        <Image
          source={{
            uri:
              data.bookCoverImage?.url_secura ||
              "https://imgs.search.brave.com/CLocZ60Ulym7ZdP1n0bu-UWYnllARxnUNFHLCXNhAsQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mb25k/by1hbWFyaWxsby15/LWFuYXJhbmphZG8t/ZGUtbGEtdGV4dHVy/YS00MTUwMDkxMS5q/cGc",
          }}
          className="w-full h-72"
          resizeMode="cover"
        />

        <View className={`absolute bottom-1 right-1 bg-secondary/80 rounded-full p-2 shadow-lg `}>
          <MaterialIcons name={iconConfig.name} size={20} color={iconConfig.color} />
        </View>
      </View>
    </TouchableOpacity>
  )
}
