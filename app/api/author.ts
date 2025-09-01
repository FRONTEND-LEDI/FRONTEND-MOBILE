import { URI } from "@/constants/ip";
export const getAuthorById = async (id: string) => {
    try {
        const response = await fetch(`http://${URI}/author/${id}`, {
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
        console.error("Error en getAuthorById:", error);
        throw error;
    }
};
