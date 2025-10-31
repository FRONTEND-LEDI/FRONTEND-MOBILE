import { URI } from "@/constants/ip";
import * as SecureStore from "expo-secure-store";
export const getAuthorById = async (id: string) => {
    try {
        const token = await SecureStore.getItemAsync("token");
            if (!token) {
              console.log("No token found");
              return null;
            }
        const response = await fetch(`http://${URI}/author/${id}`, {
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
        console.error("Error en getAuthorById:", error);
        throw error;
    }
};
