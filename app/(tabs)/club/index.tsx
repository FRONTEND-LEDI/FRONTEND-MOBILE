import { useRouter } from "expo-router";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TopicCard from "../../../components/TopicCard";
import TrendingPost from "../../../components/TrendingPost";

const trendingPosts = [
  {
    id: "1",
    title: "How To Be A Programmer",
    author: "Joko Ui",
    time: "2h ago",
    likes: 90,
    comments: 60,
    views: 150,
  },
  {
    id: "2",
    title: "React Native Tips",
    author: "Jane Dev",
    time: "1h ago",
    likes: 120,
    comments: 80,
    views: 200,
  },
  {
    id: "3",
    title: "Understanding Node.js",
    author: "Node Master",
    time: "3h ago",
    likes: 70,
    comments: 40,
    views: 110,
  },
  {
    id: "4",
    title: "Best Practices in Django",
    author: "Django Queen",
    time: "4h ago",
    likes: 60,
    comments: 30,
    views: 90,
  },
  {
    id: "5",
    title: "JavaScript Async Await",
    author: "JS Guru",
    time: "5h ago",
    likes: 100,
    comments: 55,
    views: 180,
  },
  {
    id: "6",
    title: "Python for Data Science",
    author: "Data Scientist",
    time: "6h ago",
    likes: 80,
    comments: 45,
    views: 160,
  },
  {
    id: "7",
    title: "C# Best Practices",
    author: "C# Expert",
    time: "7h ago",
    likes: 90,
    comments: 50,
    views: 140,
  },
  {
    id: "8",
    title: "Understanding TypeScript",
    author: "TypeScript Guru",
    time: "8h ago",
    likes: 100,
    comments: 60,
    views: 200,
  },
  {
    id: "9",
    title: "Web Development Trends",
    author: "Web Dev Guru",
    time: "9h ago",
    likes: 110,
    comments: 70,
    views: 220,
  },
  {
    id: "10",
    title: "Mobile App Development",
    author: "Mobile Dev",
    time: "10h ago",
    likes: 95,
    comments: 65,
    views: 190,
  },
];

export default function Forum() {
  const router = useRouter();
  return (
    <FlatList
      data={trendingPosts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/club/post/[${item.id}]`)}
        >
          <TrendingPost
            title={item.title}
            author={item.author}
            time={item.time}
            likes={item.likes}
            comments={item.comments}
            views={item.views}
          />
        </TouchableOpacity>
      )}
      ListHeaderComponent={
        <>
          <Text className="text-2xl font-bold text-primary mb-2">Club</Text>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            <TopicCard title="C#" posts={30} color="#f29200" />
            <TopicCard title="Java" posts={21} color="#a7c257" />
            <TopicCard title="JavaScript" posts={45} color="#f0db4f" />
            <TopicCard title="Python" posts={50} color="#306998" />
            <TopicCard title="React" posts={40} color="#61dafb" />
            <TopicCard title="Node.js" posts={35} color="#8CC84B" />
            <TopicCard title="Django" posts={25} color="#092E20" />
          </ScrollView>

          <Text className="text-lg font-bold text-primary mb-2">
            Trending Post
          </Text>
        </>
      }
      contentContainerStyle={{
        paddingBottom: 24,
        paddingHorizontal: 24,
        paddingTop: 40,
        backgroundColor: "#fff",
      }}
      className="flex-1 bg-light"
    />
  );
}
