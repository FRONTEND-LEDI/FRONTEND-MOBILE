import { URI } from "@/constants/ip";
import * as SecureStore from "expo-secure-store";
import { getToken } from "./chat";
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

export const getBooksByAuthor = async (id: string) => {
    try {
        const token = await getToken()
        const response = await fetch(`http://${URI}/book/autor/${id}`, {
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "x-client": "mobile",
                "Authorization": `Bearer ${token}`
            }
        })

        if(!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json()

        return data

    } catch (error) {
        console.error("Error en getAuthorById:", error);
        throw error;
    }
}