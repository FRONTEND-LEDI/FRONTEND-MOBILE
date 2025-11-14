import { IP_ADDRESS } from "@/constants/configEnv";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = `http://${IP_ADDRESS}:3402`;

export interface Author {
  _id: string;
  name: string;
}

export interface BookCoverImage {
  url_secura: string;
}

export interface Book {
  _id: string;
  title: string;
  author: Author[];
  bookCoverImage: string | BookCoverImage;
  genre?: string;
  format?: string;
}

export interface QuizOption {
  textOption: string;
  status: boolean;
}

export interface QuizResponse {
  title: string;
  scenery: string;
  page: number;
  options: QuizOption[];
  completed?: boolean;
  score?: number;
  totalQuestions?: number;
}

const getToken = async () => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    throw new Error("Token no encontrado");
  }
  return token;
};

const normalizeBookData = (data: any[]): Book[] => {
  return data.map((b: any) => ({
    ...b,
    _id: b._id || b.id,
    author: Array.isArray(b.author) ? b.author.map((a: any) => (typeof a === "string" ? { _id: a, name: a } : a)) : [],
    bookCoverImage: typeof b.bookCoverImage === "string" ? { url_secura: b.bookCoverImage } : b.bookCoverImage,
  }));
};

export const getNarrativeBooks = async (): Promise<Book[]> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/books/narrative`, {
    headers: { "Content-Type": "application/json", authorization: `Bearer ${token}`, "x-client": "mobile" },
  });

  console.log("getNarrativeBooks data:", response);
  if (!response.ok) {
    throw new Error("Error al obtener libros narrativos");
  }
  const data = await response.json();
  return normalizeBookData(data.result || data);
};

export const getBookById = async (bookId: string): Promise<Book> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/book/${bookId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("getBookById response status:", response);
  if (!response.ok) {
    throw new Error("Error al obtener los detalles del libro");
  }
  const data = await response.json();

  const normalized = normalizeBookData([data.result || data]);
  return normalized[0];
};

export const startQuiz = async (bookId: string): Promise<QuizResponse> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/quiz/${bookId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      "x-client": "mobile",
    },
    body: JSON.stringify({}),
  });
  console.log("startQuiz response status:", response.status);
  if (!response.ok) {
    throw new Error("Error al iniciar el quiz");
  }
  const data = await response.json();
  return normalizeQuizResponse(data);
};
export const submitQuizAnswer = async (bookId: string, selectedOption: string, isCorrect: boolean, currentPage: number): Promise<QuizResponse> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/quiz/${bookId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      "x-client": "mobile",
    },
    body: JSON.stringify({
      option: selectedOption,
      status: isCorrect,
      page: currentPage,
    }),
  });
  console.log("submitQuizAnswer response status:", response.status);
  if (!response.ok) {
    throw new Error("Error al enviar la respuesta del quiz");
  }
  const data = await response.json();
  return normalizeQuizResponse(data);
};

const normalizeQuizResponse = (data: any): QuizResponse => {
  return {
    title: data.title || "",
    scenery: data.scenery || "",
    page: data.page ?? 1,
    options: Array.isArray(data.options) ? data.options : [],
    completed: data.completed === true,
    score: typeof data.score === "number" ? data.score : undefined,
    totalQuestions: data.totalQuestions || 0,
  };
};

export const submitQuiz = async (bookId: string, payload: any): Promise<QuizResponse> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/quiz/${bookId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: `Bearer ${token}`, "x-client": "mobile" },
    body: JSON.stringify(payload),
  });
  console.log("submitQuiz response status:", response.status);
  if (!response.ok) {
    throw new Error("Error al enviar la respuesta del quiz");
  }
  const data = await response.json();
  return normalizeQuizResponse(data);
};
