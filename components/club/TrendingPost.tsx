import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";

interface Props {
  title: string;
  author: string;
  time: string;
  likes: number;
  comments: number;
  views: number;
}

export default function TrendingPost({
  title,
  author,
  time,
  likes,
  comments,
  views,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>
        {author} • {time}
      </Text>
      <View style={styles.stats}>
        <FontAwesome name="thumbs-up" size={14} color={colors.gray} />
        <Text style={styles.statText}>{likes} votes</Text>
        <FontAwesome
          name="comment"
          size={14}
          color={colors.gray}
          style={styles.icon}
        />
        <Text style={styles.statText}>{comments} replies</Text>
        <FontAwesome
          name="eye"
          size={14}
          color={colors.gray}
          style={styles.icon}
        />
        <Text style={styles.statText}>{views} views</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "bold", color: colors.text },
  meta: { fontSize: 12, color: colors.gray, marginVertical: 4 },
  stats: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  statText: { marginHorizontal: 4, fontSize: 12, color: colors.gray },
  icon: { marginLeft: 10 },
});
