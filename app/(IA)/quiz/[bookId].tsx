import { Book, QuizOption, getBookById, startQuiz, submitQuizAnswer } from "@/app/api/quizApi";
import colors from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_LIVES = 2;
const TOTAL_QUESTIONS = 4;

const GameHeader = ({ points, bookTitle, lives, page }: { points: number; bookTitle: string; lives: number; page: number }) => {
  const lifeIcons = [];
  for (let i = 0; i < MAX_LIVES; i++) {
    lifeIcons.push(<MaterialIcons key={i} name={i < lives ? "favorite" : "favorite-border"} size={24} color={i < lives ? "#EF4444" : "#D1D5DB"} />);
  }

  return (
    <View style={{ padding: 16, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 18, color: "#9CA3AF", flex: 1 }} numberOfLines={1}>
          {bookTitle}
        </Text>
        {/* Vidas restantes */}
        <View style={{ flexDirection: "row", gap: 4 }}>{lifeIcons}</View>
      </View>
      <Text style={{ fontSize: 30, fontWeight: "bold", color: colors.primary }}>Puntos: {points}</Text>
      {/* Progreso de preguntas */}
      <Text style={{ fontSize: 16, fontWeight: "600", color: "#4B5563", marginTop: 4 }}>
        Pregunta: {page} / {TOTAL_QUESTIONS}
      </Text>
    </View>
  );
};

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
  const [lives, setLives] = useState(MAX_LIVES);

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
      setLives(MAX_LIVES);
      setPage(1);

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

      if (initialResponse.option && Array.isArray(initialResponse.option) && initialResponse.option.length > 0) {
        setCurrentQuestion(initialResponse.scenery);
        setOptions(initialResponse.option);
        setPage(initialResponse.page || 1);
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

  // --- LÓGICA DE RESPUESTA MODIFICADA ---
  const handleConfirmAnswer = async () => {
    if (!selectedOption || !bookId || !book || isAnswering) return;

    setIsAnswering(true);
    setShowFeedback(true);

    let newScore = currentScore;
    let newLives = lives;
    let gameShouldEnd = false;

    // 1. Manejar puntuación y vidas
    if (selectedOption.status) {
      newScore += 0;
      setCurrentScore(newScore);
    } else {
      newLives -= 1;
      setLives(newLives); // <-- REGLA 1: Restar vida
    }

    // 2. Comprobar condiciones de fin de juego
    if (newLives <= 0) {
      gameShouldEnd = true; // Fin por vidas
    }
    if (page === TOTAL_QUESTIONS) {
      gameShouldEnd = true; // <-- REGLA 2: Fin por 4 preguntas
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (gameShouldEnd) {
      setFinalScore(newScore);
      setQuizCompleted(true);
      setIsAnswering(false);
      return;
    }

    try {
      const response = await submitQuizAnswer(bookId, selectedOption.textOption, selectedOption.status, page);

      console.log("Respuesta del quiz recibida:", response);

      if (response.completed === true || response.score !== undefined) {
        // La API dice que terminó (aunque nuestra lógica local ya lo cubre)
        setFinalScore(response.score ?? newScore);
        setQuizCompleted(true);
      } else if (response.option && response.option.length > 0) {
        // Cargar siguiente pregunta
        setCurrentQuestion(response.scenery);
        setOptions(response.option);
        setPage(response.page); // La API debe enviar la página 2, 3, 4
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        // Failsafe por si la API no envía más opciones
        setQuizCompleted(true);
        setFinalScore(newScore);
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
    // ... (Vista de Carga - sin cambios)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 18, color: "#4B5563" }}>Cargando quiz...</Text>
      </View>
    );
  }

  if (error) {
    // ... (Vista de Error - sin cambios)
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
      {/* --- LLAMADA AL HEADER MODIFICADO --- */}
      <GameHeader points={currentScore} bookTitle={book?.title || "Quiz"} lives={lives} page={page} />

      {quizCompleted ? (
        // ... (Vista de Quiz Completado - sin cambios)
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
        // ... (Vista de Pregunta Activa - sin cambios)
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
                  if (!option.status) {
                    opacity = 0.5;
                  }
                  if (option.status) {
                    backgroundColor = "#22C55E";
                    borderColor = "#16A34A";
                    textColor = "white";
                  }
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
