import { Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  title: string;
  posts: number;
  color: string;
}

export default function TopicCard({ title, posts, color }: Props) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{posts} posts</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 100,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#e0e0e0",
  },
});
