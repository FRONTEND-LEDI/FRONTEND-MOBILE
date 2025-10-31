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
    width: 130,
    height: 50,
    borderRadius: 25,
    padding: 6,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
  },
});
