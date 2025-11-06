import { URI } from "@/constants/ip";
import { ApiError, Memory } from "@/types/chat";
import * as SecureStore from "expo-secure-store";

// Timeout para requests (8 segundos)
const REQUEST_TIMEOUT = 1000000

export async function getToken(): Promise<string> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    throw new Error("No se encontró token. Inicia sesión.");
  }
  return token;
}

function createTimeoutPromise(timeout: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout: La solicitud tardó demasiado")), timeout);
  });
}

async function handleFetchResponse(response: Response): Promise<any> {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
    } catch {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // Si no podemos leer el cuerpo, usamos el mensaje por defecto
      }
    }
    
    const error: ApiError = {
      message: errorMessage,
      status: response.status
    };
    throw error;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return null;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number = REQUEST_TIMEOUT): Promise<Response> {
  const fetchPromise = fetch(url, options);
  const timeoutPromise = createTimeoutPromise(timeout);
  
  return Promise.race([fetchPromise, timeoutPromise]);
}

export const chat = async (message: string, sessionId: string): Promise<any> => {
  try {
    const token = await getToken();
    const response = await fetchWithTimeout(`http://${URI}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        session: sessionId, 
        msg: message 
      }),
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error en chat:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("Timeout")) {
        throw { message: "La solicitud tardó demasiado. Revisa tu conexión." };
      }
      if (error.message.includes("Network request failed")) {
        throw { message: "Error de conexión. Verifica tu internet." };
      }
    }
    
    throw error;
  }
};

export const memory = async (sessionId: string): Promise<Memory[]> => {
  try {
    const token = await getToken();
    
    // Si no hay sessionId, obtenemos todas las memorias
    if (!sessionId) {
      const response = await fetchWithTimeout(`http://${URI}/myMemory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client": "mobile",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      return await handleFetchResponse(response);
    }

    // Si hay sessionId, obtenemos memoria específica
    const response = await fetchWithTimeout(`http://${URI}/memory/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
        "Authorization": `Bearer ${token}`,
      },
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error en memory:", error);
    
    // Para errores de memoria, no lanzamos error sino que retornamos array vacío
    if ((error as ApiError)?.status === 404) {
      return [];
    }
    
    throw error;
  }
};