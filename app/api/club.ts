import { IP_ADDRESS } from "@/constants/configEnv.js";

const API_BASE_URL = `http://${IP_ADDRESS}:3402`;
type Foro = {
  _id: string;
  title: string;
  description: string;
};
export const getForosApi = async (): Promise<Foro[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/foros`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
      },
    });
    if (!response.ok) {
      console.error("Error al cargar foros: ", response.status);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching foros:", error);
    return [];
  }
};
