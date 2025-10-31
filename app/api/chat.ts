import { URI } from "@/constants/ip";
import * as SecureStore from "expo-secure-store";

async function getToken() {
  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    throw new Error("No se encontró token. Inicia sesión.");
  }
  return token;
}

// Función auxiliar para manejar errores de red y HTTP
async function handleFetchResponse(response: Response): Promise<any> {
  if (!response.ok) {
    // Intentamos parsear el cuerpo de error si está en JSON
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Si no es JSON, usamos el texto crudo
      const text = await response.text();
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  // Si la respuesta está vacía (204 No Content, por ejemplo), devolvemos null
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
    
  }

  return await response.json();
}

export const getChat = async (sessionId: string, msg: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`http://${URI}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId, msg }),
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error en getChat:", error);
    throw error; // Re-lanzamos el error para que el llamador lo maneje
  }
};

export const getMemory = async (sessionId: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`http://${URI}/myMemory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error en getMemory:", error);
    throw error;
  }
};

export const getMemoryById = async (id: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`http://${URI}/memory/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
        authorization: `Bearer ${token}`,
      },
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error en getMemoryById:", error);
    throw error;
  }
};