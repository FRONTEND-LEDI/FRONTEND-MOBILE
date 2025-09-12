import { URI } from "@/constants/ip";
import * as SecureStore from "expo-secure-store";



export const postSaveProgress = async (
  bookData: { idBook: string; status: string },
  idUser: string
) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No se encontró el token.");

    const response = await fetch(`http://${URI}/SaveProgress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        idUser, 
        idBook: bookData.idBook,
        status: bookData.status,
        startDate: new Date().toISOString(), 
      }),
    });

  
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en postSaveProgress:", error);
  }
};



// Actualizar progreso
export const updateBookProgress = async (idBook: string, status: string) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No se encontró el token.");

    const response = await fetch(`http://${URI}/progress`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ idBook, status }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error en updateBookProgress:", error);
  }
};

// Eliminar progreso
export const deleteBookProgress = async (idBook: string) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No se encontró el token.");

    const response = await fetch(`http://${URI}/progress`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ idBook }),
    });

    const data = await response.json();
    return data
  } catch (error) {
    console.error("Error en deleteBookProgress:", error);
  }
};

export const getUserProgress = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No se encontró el token.");

    const response = await fetch(`http://${URI}/Progress`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`, 
      },
    });

    if (!response.ok) throw new Error("Error al obtener progresos.");

    const data = await response.json(); 

    return data;
  } catch (error) {
    console.error("Error en getUserProgress:", error);
    return null;
  }
};

