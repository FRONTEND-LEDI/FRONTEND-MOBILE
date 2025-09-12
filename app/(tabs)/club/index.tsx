
import { getClubsApi } from "@/app/api/club";
import { IP_ADDRESS } from "@/constants/configEnv";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import TopicCard from "../../../components/club/TopicCard";
import CircleButton from "../../../components/club/addButton";

import { io } from "socket.io-client";
const URL = `http://${IP_ADDRESS}:3402/ `;
const socket = io(URL);

/* const trendingPosts = [
  {
    id: "1",
    title: "How To Be A Programmer",
    author: "Joko Ui",
    time: "2h ago",
    likes: 90,
    comments: 60,
    views: 150,
  },
]; */

type Club = {
  id: number;
  name: string;
  description: string;
};

export default function Forum() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await getClubsApi();
        setClubs(data.clubs);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    };
    fetchClubs();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={clubs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TopicCard
            title={item.name}
            posts={0}
            color="#f29200"
            description={item.description}
          />
        )}
        ListHeaderComponent={
          <>
            <Text className="text-base text-dark mb-6 text-center">
              Encuentra y participa en los temas que más te interesan.
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {["Popular", "Recommended", "New Topic", "Latest"].map((tab) => (
                <View
                  key={tab}
                  className="bg-secondary rounded-full px-4 py-2 mr-2"
                >
                  <Text className="text-dark font-bold">{tab}</Text>
                </View>
              ))}
            </ScrollView>

            <Text className="text-lg font-bold text-primary mb-2">
              Popular Topics
            </Text>
          </>
        }
        contentContainerStyle={{
          paddingBottom: 100, // Add extra space for the button
          paddingHorizontal: 24,
          paddingTop: 40,
        }}
        className="flex-1 bg-light"
      />
      <View style={styles.fabContainer}>
        <CircleButton onPress={() => router.push("./create")} />
      </View>
    </View>
  );
}

const styles = {
  fabContainer: {
    position: "absolute" as "absolute",
    bottom: 16,
    right: 115,
  },
};
