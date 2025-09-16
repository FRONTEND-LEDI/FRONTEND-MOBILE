import { authContext } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useState } from "react";
import {
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { io, Socket } from "socket.io-client";
import TopicCard from "../../../components/club/TopicCard";

const URL = `http://${IP_ADDRESS}:3402`;
let socket: Socket;

type Foro = {
  _id: string;
  title: string;
  description: string;
};

type Comentario = {
  _id: string;
  idForo: string;
  idUser: string;
  content: string;
};

export default function Forum() {
  const [foros, setForos] = useState<Foro[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedForoId, setSelectedForoId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { user } = useContext(authContext);

  useFocusEffect(
    useCallback(() => {
      socket = io(URL);
      console.log("Pantalla concentrada...");
      socket.on("connect", () => {
        console.log("Connected to Socket.IO server!");
        socket.emit("get-all-foros");
        socket.emit("all-public");
      });

      socket.on("all-foros", (data: Foro[]) => {
        console.log("Received foros:", data);
        setForos(data);
      });

      socket.on("comments", (data: Comentario[]) => {
        console.log("Todos los Comentarios recibidos: ", data);
        setComentarios(data);
      });

      socket.on("foro-comments", (data: Comentario[]) => {
        console.log("Recibidos comentarios de un foro", data);
        setComentarios(data);
      });

      socket.on("coment-created", (data) => {
        if (data.idForo === selectedForoId) {
          setComentarios((prevComentarios) => [data, ...prevComentarios]);
        }
        console.log("comentario creado: ", data);
      });

      socket.on("error", (error: { msg: string }) => {
        console.error("Socket.IO error:", error.msg);
      });

      return () => {
        socket.off("connect");
        socket.off("all-foros");
        socket.off("coments");
        socket.off("foro-comments");
        socket.off("coment-created");
        socket.off("error");
        socket.disconnect();
        console.log("Disconnecting socket");
      };
    }, [selectedForoId])
  );

  const handleTopicPress = (foroId: string) => {
    setSelectedForoId(foroId);

    setIsModalVisible(true);
  };
  const handleSendComment = () => {
    if (selectedForoId && newComment.trim()) {
      const commentData = {
        idForo: selectedForoId,
        idUser: user?.id,
        content: newComment,
      };
      socket.emit("new-public", commentData);
      setNewComment("");
      setIsModalVisible(false);
      setSelectedForoId(null);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 100,
          paddingHorizontal: 24,
          paddingTop: 40,
        }}
        className="flex-1 bg-light"
      >
        <Text className="text-base text-dark mb-6 text-center">
          Encuentra y participa en los temas que más te interesan.
        </Text>

        <Text className="text-lg font-bold text-primary mb-2">
          Popular Topics
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24 }}
        >
          <TouchableOpacity key={null}>
            <TopicCard
              title="GETALL"
              color={colors.secondary}
              description="Trae todos"
            />
          </TouchableOpacity>

          {foros.map((item) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => handleTopicPress(item._id)}
            >
              <TopicCard
                title={item.title}
                posts={0}
                color="#f29200"
                description={item.description}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.commentsHeader}>Comentarios</Text>
        {comentarios.map((comment) => (
          <View key={comment._id} style={styles.commentContainer}>
            <Text style={styles.commentText}>{comment.content}</Text>
          </View>
        ))}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Escribe tu comentario</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Tu comentario..."
                multiline={true}
                value={newComment}
                onChangeText={setNewComment}
              />
              <View style={styles.modalButtons}>
                <Button
                  title="Cancelar"
                  onPress={() => setIsModalVisible(false)}
                  color={colors.primary}
                />
                <Button
                  title="Enviar"
                  onPress={handleSendComment}
                  color={colors.secondary}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalInput: {
    width: "100%",
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  commentsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  commentContainer: {
    backgroundColor: colors.gray,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 16,
  },
});
