import { URI } from "@/constants/ip";
import * as SecureStore from "expo-secure-store";

export const getBooks = async () => {
  try {
    const response = await fetch(`http://${URI}/books`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error en getBooks:", error);
    throw error;
  }
};

export const getBookById = async (id: string) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      console.log("No token found");
      return null;
    }
    const response = await fetch(`http://${URI}/book/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
      },
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error en getBookById:", error);
    throw error;
  }
};

export const getBySearch = async (query: string) => {
  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      throw new Error("No se encontró el token. Inicia sesión nuevamente.");
    }

    const response = await fetch(`http://${URI}/books/${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        "x-client": "mobile",
      },
      credentials: "include",
    });

    // Verificar antes de parsear
    if (!response.ok) {
      const text = await response.text();
      console.error("Respuesta no OK:", response.status, text);
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error en getBySearch:", error);
    throw error;
  }
};

export const getBooksByFiltering = async (filters: { theme?: string[]; subgenre?: string[]; yearBook?: string[]; format?: string[]; genre?: string[] }) => {
  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      throw new Error("No se encontró el token. Inicia sesión nuevamente.");
    }
    const response = await fetch(`http://${URI}/booksByFiltering`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}`, "x-client": "mobile" },
      body: JSON.stringify(filters),
    });

    if (!response.ok) throw new Error("Error en la petición");

    const data = response.json();

    return data;
  } catch (error) {
    console.error("Error en getBooksByFiltering:", error);
    return [];
  }
};

export const getNarrativeBooks = async () => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    throw new Error("No se encontró el token. Inicia sesión nuevamente.");
  }
  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      throw new Error("No se encontró el token. Inicia sesión nuevamente.");
    }
    const response = await fetch(`http://${URI}/booksByFiltering`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}`, "x-client": "mobile" },
      body: JSON.stringify({ theme: [], subgenre: [], yearBook: [], genre: ["Narrativo"], format: [] }),
    });

    if (!response.ok) throw new Error("Error en la petición");

    const data = response.json();

    return data;
  } catch (error) {
    console.error("Error en getBooksByFiltering:", error);
    return [];
  }
};
