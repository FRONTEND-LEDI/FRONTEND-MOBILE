
import { URI } from "@/constants/ip";
import * as SecureStore from "expo-secure-store";

export const booksbyRecomendation = async () => {
  try {
    
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      throw new Error("No se encontró el token. Inicia sesión nuevamente.");
    }

    const response = await fetch(
      `http://${URI}/recommendations`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`,
        },
        credentials: "include"
        
      }
    );

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return data
  } catch (error) {
    console.error("Error en getBySearch:", error);
    throw error;
  }
};

export const getBookbyLatestProgress = async () => {
  try {
    
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      throw new Error("No se encontró el token. Inicia sesión nuevamente.");
    }

    const response = await fetch(
      `http://${URI}/bookProgress`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`,
        },
        credentials: "include"
        
      }
    );

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return data
  } catch (error) {
    console.error("Error en getBySearch:", error);
    throw error;
  }
};




