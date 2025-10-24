import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  posts?: number;
  color: string;
};

export default function TopicCard({ title, posts, color }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      {/*       <Text style={styles.subtitle}>{posts} posts</Text>{" "}
       */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    height: 80,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "#e0e0e0",
  },
});
