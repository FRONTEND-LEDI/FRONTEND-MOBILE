import React, { useRef, useState } from "react";
import { Dimensions, Image, Text, View } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const data = [
  {
    title: "Libro 1",
    image: require("@/assets/images/portada.webp"),
  },
  {
    title: "Libro 2",
    image: require("@/assets/images/portada.webp"),
  },
  {
    title: "Libro 3",
    image: require("@/assets/images/portada.webp"),
  },
];

export default function BookCarousel() {
  const ref = useRef<ICarouselInstance>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View className="items-center mt-6">
      <Carousel
        ref={ref}
        loop
        width={width * 0.65}
        height={320}
        autoPlay={false}
        data={data}
        scrollAnimationDuration={600}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl shadow-lg overflow-hidden items-center">
            <Image
              source={item.image}
              className="w-56 h-56 rounded-t-2xl"
              resizeMode="cover"
            />
            <Text className="text-base font-semibold text-center p-2">{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}
