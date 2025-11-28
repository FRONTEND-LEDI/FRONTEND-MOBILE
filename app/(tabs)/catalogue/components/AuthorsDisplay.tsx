import { AuthorType } from "@/types/author";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface AuthorsDisplayProps {
  authors: AuthorType[];
  idBook: string;
}

export default function AuthorsDisplay({ authors, idBook }: AuthorsDisplayProps) {
  const router = useRouter();
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const MAX_VISIBLE_AUTHORS = 1;
  
  const hasMoreAuthors = authors.length > MAX_VISIBLE_AUTHORS;
  const visibleAuthors = authors.slice(0, MAX_VISIBLE_AUTHORS);
  const remainingCount = authors.length - MAX_VISIBLE_AUTHORS;

  const handleAuthorPress = (authorId: string) => {
    router.push(`./${idBook}/author/${authorId}`);
  };

  // Si solo hay 1-2 autores, mostrar directamente sin complicaciones
  if (authors.length <= MAX_VISIBLE_AUTHORS) {
    return (
      <View className="items-center mb-4">
        {authors.map((author) => (
          <TouchableOpacity
            key={author._id}
            className="flex-row items-center justify-center mb-2 bg-gray-50 px-4 py-2 rounded-full"
            onPress={() => handleAuthorPress(author._id)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: author.avatar.url_secura }}
              className="w-8 h-8 rounded-full mr-2 border-2 border-primary"
            />
            <Text className="text-base text-gray-700 font-medium">
              {author.fullName}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // Para 3+ autores, mostrar vista compacta con modal
  return (
    <>
      <View className="items-center mb-4">
        {/* Primeros 2 autores visibles */}
        {visibleAuthors.map((author) => (
          <TouchableOpacity
            key={author._id}
            className="flex-row items-center justify-center mb-2 bg-gray-50 px-4 py-2 rounded-full"
            onPress={() => handleAuthorPress(author._id)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: author.avatar.url_secura }}
              className="w-8 h-8 rounded-full mr-2 border-2 border-primary"
            />
            <Text className="text-base text-gray-700 font-medium">
              {author.fullName}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        {/* Botón para mostrar todos */}
        <TouchableOpacity
          className="flex-row items-center bg-primary/10 px-5 py-2.5 rounded-full mt-1"
          onPress={() => setShowAllAuthors(true)}
          activeOpacity={0.7}
        >
          <View className="flex-row mr-2">
            {authors.slice(MAX_VISIBLE_AUTHORS, MAX_VISIBLE_AUTHORS + 3).map((author, idx) => (
              <Image
                key={author._id}
                source={{ uri: author.avatar.url_secura }}
                style={{
                  width: 24,
                  height: 24,
                  marginLeft: idx > 0 ? -8 : 0,
                  borderWidth: 2,
                  borderColor: 'white',
                }}
                className="rounded-full"
              />
            ))}
          </View>
          <Text className="text-primary font-semibold text-sm">
            +{remainingCount} {remainingCount === 1 ? 'autor más' : 'autores más'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showAllAuthors}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAllAuthors(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowAllAuthors(false)}
        >
          <Pressable 
            className="bg-white rounded-t-3xl"
            style={{ maxHeight: '80%' }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle visual del modal */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="px-6 py-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <MaterialIcons name="people" size={24} color="#D97706" />
                  <Text className="text-xl font-bold text-gray-800 ml-2">
                    Autores ({authors.length})
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAllAuthors(false)}
                  className="w-8 h-8 items-center justify-center bg-gray-100 rounded-full"
                >
                  <MaterialIcons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Lista completa scrolleable */}
            <ScrollView 
              className="px-6 py-4"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {authors.map((author) => (
                <TouchableOpacity
                  key={author._id}
                  className="flex-row items-center py-4 border-b border-gray-50"
                  onPress={() => {
                    setShowAllAuthors(false);
                    handleAuthorPress(author._id);
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: author.avatar.url_secura }}
                    className="w-14 h-14 rounded-full border-2 border-primary/20"
                  />
                  <View className="flex-1 ml-4">
                    <Text className="text-base font-semibold text-gray-800">
                      {author.fullName}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      Ver biografía
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#D97706" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}