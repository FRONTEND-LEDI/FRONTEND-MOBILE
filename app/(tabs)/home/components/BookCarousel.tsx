import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 3.5;
type Book = {
  _id: string;
  bookCoverImage: {
    url_segura: string;
  };
};

type BookCarouselProps = {
  data: Book[];
};

export default function BookCarousel({ data }: BookCarouselProps) {
  const router = useRouter();

  const flatListRef = useRef<FlatList>(null);
  const scrollPosition = useRef(0);

  const scrollBy = (offset: number) => {
    scrollPosition.current += offset;
    flatListRef.current?.scrollToOffset({
      offset: scrollPosition.current,
      animated: true,
    });
  };

  return (
    <View className="my-4 relative">
      {/* Flecha izquierda */}
      <TouchableOpacity
        onPress={() => scrollBy(-ITEM_WIDTH * 1.5)}
        style={{
          position: "absolute",
          left: 0,
          top: 80,
          zIndex: 1,
          backgroundColor: "rgba(255,255,255,0.7)",
          padding: 4,
          borderRadius: 20,
        }}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Flecha derecha */}
      <TouchableOpacity
        onPress={() => scrollBy(ITEM_WIDTH * 1.5)}
        style={{
          position: "absolute",
          right: 0,
          top: 80,
          zIndex: 1,
          backgroundColor: "rgba(255,255,255,0.7)",
          padding: 4,
          borderRadius: 20,
        }}
      >
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + 8}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (width - (ITEM_WIDTH * 3 + 8 * 2)) / 2,
        }}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/catalogue/${item._id}`)}
            className="items-center"
            style={{ width: ITEM_WIDTH, marginRight: 8 }}
          >
            <Image
              source={{
                uri:
                  item.bookCoverImage.url_secura ||
                  "https://imgs.search.brave.com/CLocZ60Ulym7ZdP1n0bu-UWYnllARxnUNFHLCXNhAsQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mb25k/by1hbWFyaWxsby15/LWFuYXJhbmphZG8t/ZGUtbGEtdGV4dHVy/YS00MTUwMDkxMS5q/cGc",
              }}
              className="rounded-lg"
              style={{ width: ITEM_WIDTH - 20, height: 180 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        onScroll={(e) => {
          scrollPosition.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      />
    </View>
  );
}
