import { Book, QuizOption, getBookById, startQuiz, submitQuizAnswer } from "@/app/api/quizApi";
import colors from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_LIVES = 2;

const TypewriterQuestion = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = React.useRef<any>(null);

  useEffect(() => {
    if (!text) return;

    setDisplayedText("");
    setIsComplete(false);

    if (intervalRef.current) clearInterval(intervalRef.current);

    let index = 0;
    intervalRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  const handlePress = () => {
    if (!isComplete) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayedText(text);
      setIsComplete(true);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={{
        backgroundColor: "white",
        padding: 24,
        borderRadius: 20,
        marginBottom: 32,
        minHeight: 120,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.5)",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: colors.gray,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Pregunta
      </Text>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: "#1F2937",
          lineHeight: 24,
          textAlign: "center",
        }}
      >
        {displayedText}
        {!isComplete && <Text style={{ fontSize: 16, color: colors.primary }}>|</Text>}
      </Text>
      {!isComplete && (
        <Text style={{ marginTop: 8, fontSize: 12, color: colors.gray, fontStyle: 'italic' }}>
          (Toca para ver todo)
        </Text>
      )}
    </TouchableOpacity>
  );
};

const GameHeader = ({
  points,
  bookTitle,
  lives,
  page,
  timeLeft,
}: {
  points: number;
  bookTitle: string;
  lives: number;
  page: number;
  timeLeft: number;
}) => {
  const lifeIcons = [];
  for (let i = 0; i < MAX_LIVES; i++) {
    lifeIcons.push(
      <MaterialIcons
        key={i}
        name={i < lives ? "favorite" : "favorite-border"}
        size={28}
        color={i < lives ? "#EF4444" : "rgba(255,255,255,0.4)"}
        style={{ marginLeft: 4 }}
      />
    );
  }

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>PUNTOS</Text>
        <Text style={{ fontSize: 28, fontWeight: "900", color: "white" }}>{points}</Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>TIEMPO</Text>
        <View style={{
          backgroundColor: timeLeft <= 5 ? "#EF4444" : "rgba(255,255,255,0.2)",
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 12,
          minWidth: 60,
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>{timeLeft}s</Text>
        </View>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <View style={{ flexDirection: "row" }}>{lifeIcons}</View>
      </View>
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
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeout, setIsTimeout] = useState(false);

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
      setTimeLeft(60);
      setIsTimeout(false);

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
        setCurrentQuestion(initialResponse.scenery || "");

        setOptions(initialResponse.options);
        setPage(initialResponse.page || 1);
        setTimeLeft(60);
        setIsTimeout(false);
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

  const handleTimeOut = async () => {
    if (quizCompleted || showFeedback || isAnswering) return;

    setIsAnswering(true);
    setShowFeedback(true);
    setIsTimeout(true);

    const newLives = lives - 1;
    setLives(newLives);

    const wrongOption = options.find(o => !o.status) || options[0];

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (newLives <= 0) {
      setFinalScore(currentScore);
      setQuizCompleted(true);
      setIsAnswering(false);
      return;
    }

    try {
      const quizPayload = {
        title: book?.title || "",
        scenery: currentQuestion,
        page: page,
        option: {
          text: wrongOption?.textOption || "TIMEOUT",
          status: false,
        },
      };

      const response = await submitQuizAnswer(bookId!, quizPayload);

      if (response.completed === true) {
        setFinalScore(response.score ?? currentScore);
        setQuizCompleted(true);
      } else if (response.options && response.options.length > 0) {
        setCurrentQuestion(response.scenery || "");
        setOptions(response.options);
        setPage(response.page || page + 1);
        setSelectedOption(null);
        setShowFeedback(false);
        setIsTimeout(false);
        setTimeLeft(60);
      } else {
        setQuizCompleted(true);
        setFinalScore(currentScore);
      }
    } catch (err: any) {
      console.error("Error submitting timeout:", err);
      setError("Error: " + err.message);
    } finally {
      setIsAnswering(false);
    }
  };

  useEffect(() => {
    if (quizCompleted || showFeedback || isAnswering || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizCompleted, showFeedback, isAnswering, currentQuestion]);

  const handleSelectOption = (option: QuizOption) => {
    if (quizCompleted || showFeedback || isAnswering) return;
    setSelectedOption(option);
  };

  const handleConfirmAnswer = async () => {
    if (!selectedOption || !bookId || !book || isAnswering) return;

    setIsAnswering(true);
    setShowFeedback(true);

    let newScore = currentScore;
    let newLives = lives;
    let gameShouldEnd = false;

    if (selectedOption.status) {
      newScore += 10;
      setCurrentScore(newScore);
    } else {
      newLives -= 1;
      setLives(newLives);
    }

    if (newLives <= 0) {
      gameShouldEnd = true;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (gameShouldEnd) {
      setFinalScore(newScore);
      setQuizCompleted(true);
      setIsAnswering(false);
      return;
    }

    try {
      const quizPayload = {
        title: book.title,
        scenery: currentQuestion,
        page: page,
        option: {
          text: selectedOption.textOption,
          status: selectedOption.status,
        },
      };

      const response = await submitQuizAnswer(bookId, quizPayload);

      console.log("Respuesta del quiz recibida:", response);

      if (response.completed === true) {
        setFinalScore(response.score ?? newScore);
        setQuizCompleted(true);
      } else if (response.options && response.options.length > 0) {
        setCurrentQuestion(response.scenery || "");
        setOptions(response.options);
        setPage(response.page || page + 1);
        setSelectedOption(null);
        setShowFeedback(false);
        setTimeLeft(60);
        setIsTimeout(false);
      } else {
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
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 18, color: "#4B5563" }}>Cargando quiz...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Stack.Screen options={{ title: "Error", headerShown: true }} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#DC2626",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            ¡Oops! Algo salió mal
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: "#4B5563",
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 32,
              paddingVertical: 12,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Volver a Libros</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={["#F59E0B", "#D97706", "#92400E"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <GameHeader points={currentScore} bookTitle={book?.title || "Quiz"} lives={lives} page={page} timeLeft={timeLeft} />

        {quizCompleted ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            <View style={{ backgroundColor: "white", padding: 32, borderRadius: 24, width: "100%", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 }}>
              <MaterialIcons name="emoji-events" size={80} color={colors.primary} style={{ marginBottom: 16 }} />
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                ¡Quiz Completado!
              </Text>
              <Text style={{ fontSize: 18, color: "#6B7280", marginBottom: 24 }}>Tu puntuación final</Text>
              <Text
                style={{
                  fontSize: 80,
                  fontWeight: "900",
                  color: colors.primary,
                  marginBottom: 40,
                  textShadowColor: "rgba(217, 119, 6, 0.3)",
                  textShadowOffset: { width: 0, height: 4 },
                  textShadowRadius: 8,
                }}
              >
                {finalScore}
              </Text>

              <TouchableOpacity
                onPress={initializeQuiz}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 32,
                  paddingVertical: 16,
                  borderRadius: 16,
                  width: "100%",
                  alignItems: "center",
                  marginBottom: 12,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>Reintentar Quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  backgroundColor: "#F3F4F6",
                  paddingHorizontal: 32,
                  paddingVertical: 16,
                  borderRadius: 16,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#4B5563", fontSize: 18, fontWeight: "bold" }}>Volver a Libros</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={{ padding: 20 }}>
              <TypewriterQuestion text={currentQuestion} />

              <View style={{ gap: 16 }}>
                {options.map((option, idx) => {
                  const isSelected = selectedOption?.textOption === option.textOption;
                  const showResult = showFeedback && isSelected;

                  let backgroundColor = "white";
                  let borderColor = "transparent"; // We'll use borderBottom for 3D effect
                  let borderBottomColor = "#E5E7EB";
                  let textColor = "#4B5563";

                  if (isSelected) {
                    backgroundColor = "#FFF7ED"; // Light orange
                    borderColor = colors.primary;
                    borderBottomColor = "#B45309";
                    textColor = colors.primary;
                  }

                  if (showResult) {
                    if (option.status) {
                      backgroundColor = "#DCFCE7";
                      borderColor = "#16A34A";
                      borderBottomColor = "#15803D";
                      textColor = "#166534";
                    } else {
                      backgroundColor = "#FEE2E2";
                      borderColor = "#DC2626";
                      borderBottomColor = "#B91C1C";
                      textColor = "#991B1B";
                    }
                  }

                  // If feedback is shown and this option is the CORRECT one (even if not selected), highlight it
                  if (showFeedback && !isSelected && option.status) {
                    backgroundColor = "#DCFCE7";
                    borderColor = "#16A34A";
                    borderBottomColor = "#15803D";
                    textColor = "#166534";
                  }

                  // Dim incorrect unselected options
                  const opacity = (showFeedback && !isSelected && !option.status) ? 0.5 : 1;

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSelectOption(option)}
                      disabled={showFeedback || isAnswering}
                      activeOpacity={0.9}
                      style={{
                        width: "100%",
                        padding: 20,
                        borderRadius: 16,
                        backgroundColor,
                        borderWidth: 2,
                        borderColor: isSelected || (showFeedback && option.status) ? borderColor : "white",
                        borderBottomWidth: 6,
                        borderBottomColor: isSelected || (showFeedback && option.status) ? borderBottomColor : "#E5E7EB",
                        opacity,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          color: textColor,
                          flex: 1,
                        }}
                      >
                        {option.textOption}
                      </Text>
                      {showResult && (
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: option.status ? "#16A34A" : "#DC2626",
                            justifyContent: "center",
                            alignItems: "center",
                            marginLeft: 12,
                          }}
                        >
                          <MaterialIcons
                            name={option.status ? "check" : "close"}
                            size={20}
                            color="white"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showFeedback && (selectedOption || isTimeout) && (
                <View
                  style={{
                    marginTop: 24,
                    padding: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderWidth: 2,
                    borderColor: (selectedOption?.status && !isTimeout) ? "#22C55E" : "#EF4444",
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialIcons
                      name={(selectedOption?.status && !isTimeout) ? "check-circle" : "cancel"}
                      size={32}
                      color={(selectedOption?.status && !isTimeout) ? "#15803D" : "#991B1B"}
                    />
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: (selectedOption?.status && !isTimeout) ? "#15803D" : "#991B1B",
                      }}
                    >
                      {isTimeout
                        ? "¡Tiempo Agotado!"
                        : (selectedOption?.status ? "¡Correcto!" : "¡Incorrecto!")}
                    </Text>
                  </View>
                </View>
              )}

              {!showFeedback && (
                <TouchableOpacity
                  onPress={handleConfirmAnswer}
                  disabled={!selectedOption || isAnswering}
                  style={{
                    marginTop: 32,
                    width: "100%",
                    height: 64,
                    borderRadius: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: !selectedOption || isAnswering ? "rgba(255,255,255,0.3)" : "white",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Text style={{ color: !selectedOption || isAnswering ? "rgba(255,255,255,0.5)" : colors.primary, fontSize: 20, fontWeight: "900" }}>
                    {isAnswering ? "PROCESANDO..." : "CONFIRMAR"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
