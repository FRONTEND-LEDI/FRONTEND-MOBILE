import { URI } from "@/constants/ip";
import * as SecureStore from "expo-secure-store";


export const postSaveProgress = async (bookDate: { id: string; status: string }) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No se encontró el token.");

    const response = await fetch(`http://${URI}/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookDate), // mandar el objeto directamente
    });

    return await response.json();
  } catch (error) {
    console.error("Error en postSaveProgress:", error);
  }
};

export const updateBookProgress = async (id: string, status: string) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No se encontró el token.");

    const response = await fetch(`http://${URI}/progress`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error en updateBookProgress:", error);
  }
};

export const deleteBookProgress = async (id: string) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No se encontró el token.");

    const response = await fetch(`http://${URI}/progress`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error en deleteBookProgress:", error);
  }
};
