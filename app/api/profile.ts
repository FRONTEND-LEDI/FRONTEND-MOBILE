import { IP_ADDRESS } from "@/constants/configEnv";
const API_BASE_URL = `http://${IP_ADDRESS}:3402`;

export interface MedalImage {
  url_secura: string;
  id_image: string;
}

export interface Medal {
  img: MedalImage;
  _id: string;
  name: string;
  medals_posicion: number;
  __v: number;
}

export interface MedalResponse {
  msg: string;
  medal: Medal;
}

export const getMedals = async (idMedal: string): Promise<MedalResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/medal/${idMedal}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener la medalla: ${response.status}`);
    }

    const data: MedalResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getMedals:", error);
    throw error;
  }
};

export const updateUser = async (user: any, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/updateUser`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        newUser: user
      })
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar el usuario: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en updateUser:", error);
    throw error;
  }
}
