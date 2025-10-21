// No module-level API calls here; component receives `foros` as prop
import TopicCard from "@/components/club/TopicCard";
import colors from "@/constants/colors";
import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";

type Foro = {
  _id: string;
  title: string;
  description: string;
};

interface ForoTopicsProps {
  foros: Foro[];
  selectedForoId: string | null;
  onTopicPress: (foroId: string) => void;
  onGetAllComments: () => void;
}
const ForoTopics: React.FC<ForoTopicsProps> = ({
  foros,
  selectedForoId,
  onTopicPress,
  onGetAllComments,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-0 py-1"
    >
      <TouchableOpacity
        key="get-all"
        onPress={() => {
          console.log("ForoTopics: onGetAllComments pressed");
          onGetAllComments();
        }}
        className="mr-2"
      >
        <TopicCard
          title="General"
          color={colors.secondary}
          description="Trae todos"
        />
      </TouchableOpacity>
      {foros.map((item) => (
        <TouchableOpacity
          key={item._id}
          onPress={() => {
            console.log("ForoTopics: topic pressed", item._id);
            onTopicPress(item._id);
          }}
          className="mr-2"
        >
          <TopicCard
            title={item.title}
            color={colors.primary}
            description={item.description}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default ForoTopics;
