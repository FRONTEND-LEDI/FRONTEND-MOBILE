import { Book, QuizOption, getBookById, startQuiz, submitQuizAnswer } from "@/app/api/quizApi";
import colors from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GameHeader = ({ points, bookTitle }: { points: number; bookTitle: string }) => (
  <View style={{ padding: 16, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
    <Text style={{ fontSize: 18, color: "#9CA3AF" }} numberOfLines={1}>
      {bookTitle}
    </Text>
    <Text style={{ fontSize: 30, fontWeight: "bold", color: colors.primary }}>Puntos: {points}</Text>
  </View>
);

export default function QuizScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [page, setPage] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);

  const initializeQuiz = useCallback(async () => {
    if (!bookId) {
      console.log("ID DEL LIBRO", bookId);
      setError("No se recibió el ID del libro");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setQuizCompleted(false);
      setCurrentScore(0);
      setFinalScore(0);
      setSelectedOption(null);
      setShowFeedback(false);

      const bookData = await getBookById(bookId);
      console.log("BOOKDATA", bookData);
      setBook(bookData);

      if (bookData.genre !== "Narrativo") {
        setError("Los quiz solo están disponibles para libros Narrativos.");
        setLoading(false);
        return;
      }

      console.log("Iniciando quiz con bookId:", bookId);
      const initialResponse = await startQuiz(bookId);

      console.log("Respuesta inicial del quiz:", initialResponse);

      if (initialResponse.options && Array.isArray(initialResponse.options) && initialResponse.options.length > 0) {
        setCurrentQuestion(initialResponse.scenery);
        setOptions(initialResponse.options);
        setPage(initialResponse.page);
      } else {
        throw new Error(`No se recibieron opciones del servidor. Respuesta: ${JSON.stringify(initialResponse)}`);
      }
    } catch (err: any) {
      console.error("Error inicializando quiz:", err);
      setError(err.message || "Error al cargar el quiz");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    initializeQuiz();
  }, [initializeQuiz]);

  const handleSelectOption = (option: QuizOption) => {
    if (quizCompleted || showFeedback || isAnswering) return;
    setSelectedOption(option);
  };

  const handleConfirmAnswer = async () => {
    if (!selectedOption || !bookId || !book || isAnswering) return;

    setIsAnswering(true);
    setShowFeedback(true);

    if (selectedOption.status) {
      setCurrentScore((prev) => prev + 10);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await submitQuizAnswer(bookId, selectedOption.textOption, selectedOption.status, page);

      console.log("Respuesta del quiz recibida:", response);

      if (response.completed === true) {
        setFinalScore(response.score ?? currentScore + (selectedOption.status ? 10 : 0));
        setQuizCompleted(true);
      } else if (response.options && response.options.length > 0) {
        setCurrentQuestion(response.scenery);
        setOptions(response.options);
        setPage(response.page);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        setQuizCompleted(true);
        setFinalScore(currentScore + (selectedOption.status ? 10 : 0));
      }
    } catch (err: any) {
      console.error("Error confirmando respuesta:", err);
      setError("Error al enviar la respuesta: " + err.message);
      setShowFeedback(false);
    } finally {
      setIsAnswering(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 18, color: "#4B5563" }}>Cargando quiz...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Stack.Screen options={{ title: "Error", headerShown: true }} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#DC2626", marginBottom: 16, textAlign: "center" }}>¡Oops! Algo salió mal</Text>
          <Text style={{ fontSize: 18, color: "#4B5563", marginBottom: 32, textAlign: "center" }}>{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 9999 }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Volver a Libros</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <GameHeader points={currentScore} bookTitle={book?.title || "Quiz"} />

      {quizCompleted ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🎉</Text>
          <Text style={{ fontSize: 30, fontWeight: "bold", color: "#1F2937", marginBottom: 8 }}>¡Quiz Completado!</Text>
          <Text style={{ fontSize: 18, color: "#4B5563", marginBottom: 24 }}>Tu puntuación final:</Text>
          <Text style={{ fontSize: 72, fontWeight: "900", color: colors.primary, marginBottom: 40 }}>{finalScore}</Text>

          <TouchableOpacity
            onPress={initializeQuiz}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 40,
              paddingVertical: 16,
              borderRadius: 9999,
              width: "100%",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>Reintentar Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: "#E5E7EB", paddingHorizontal: 40, paddingVertical: 16, borderRadius: 9999, width: "100%", alignItems: "center" }}
          >
            <Text style={{ color: "#1F2937", fontSize: 18, fontWeight: "600" }}>Volver a Libros</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 20 }}>
            <View style={{ backgroundColor: "#FEF3C7", padding: 24, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: "#FDE68A" }}>
              <Text style={{ fontSize: 18, color: "#1F2937", lineHeight: 24 }}>{currentQuestion}</Text>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {options.map((option, idx) => {
                const isSelected = selectedOption?.textOption === option.textOption;
                const showResult = showFeedback && isSelected;

                let backgroundColor = "white";
                let borderColor = colors.primary;
                let textColor = "#1F2937";
                let opacity = 1;

                if (isSelected) {
                  backgroundColor = colors.primary;
                  borderColor = "#B45309";
                  textColor = "white";
                }
                if (showResult && option.status) {
                  backgroundColor = "#22C55E";
                  borderColor = "#16A34A";
                  textColor = "white";
                }
                if (showResult && !option.status) {
                  backgroundColor = "#EF4444";
                  borderColor = "#DC2626";
                  textColor = "white";
                }

                if (showFeedback && !isSelected) {
                  opacity = 0.5;
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectOption(option)}
                    disabled={showFeedback || isAnswering}
                    style={{
                      width: "48%",
                      minHeight: 100,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor,
                      backgroundColor,
                      opacity,
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "600", textAlign: "center", color: textColor }}>{option.textOption}</Text>
                    {showResult && (
                      <View
                        style={{
                          position: "absolute",
                          top: -12,
                          right: -12,
                          width: 32,
                          height: 32,
                          backgroundColor: "white",
                          borderRadius: 16,
                          justifyContent: "center",
                          alignItems: "center",
                          borderWidth: 2,
                          borderColor: "#D1D5DB",
                        }}
                      >
                        <MaterialIcons name={option.status ? "check" : "close"} size={20} color={option.status ? "green" : "red"} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {showFeedback && selectedOption && (
              <View
                style={{
                  padding: 16,
                  borderRadius: 16,
                  marginVertical: 16,
                  alignItems: "center",
                  backgroundColor: selectedOption.status ? "#DCFCE7" : "#FEE2E2",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: selectedOption.status ? "#15803D" : "#991B1B",
                  }}
                >
                  {selectedOption.status ? "¡Correcto!" : "¡Incorrecto!"}
                </Text>
              </View>
            )}

            {!showFeedback && (
              <TouchableOpacity
                onPress={handleConfirmAnswer}
                disabled={!selectedOption || isAnswering}
                style={{
                  marginTop: 16,
                  width: "100%",
                  height: 64,
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: !selectedOption || isAnswering ? "#D1D5DB" : colors.primary,
                }}
              >
                <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>{isAnswering ? "Procesando..." : "Confirmar Respuesta"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
