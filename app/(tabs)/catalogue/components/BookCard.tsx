import { Image, TouchableOpacity } from "react-native";

type Book = {
  _id: string;
  bookCoverImage: {
    url_secura: string;
  };
};

type BookCardProps = {
  data: Book;
  onPress: () => void;
};

export default function BookCard({ data, onPress }: BookCardProps) {
  return (
    <TouchableOpacity
      className="w-[48%] items-center bg-fifth rounded-xl overflow-hidden shadow-md"
      onPress={onPress}
    >
      <Image
        source={{ uri: data.bookCoverImage.url_secura|| "https://imgs.search.brave.com/CLocZ60Ulym7ZdP1n0bu-UWYnllARxnUNFHLCXNhAsQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mb25k/by1hbWFyaWxsby15/LWFuYXJhbmphZG8t/ZGUtbGEtdGV4dHVy/YS00MTUwMDkxMS5q/cGc"}}
        className="w-full h-72"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}
