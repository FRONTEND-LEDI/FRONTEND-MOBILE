import { IP_ADDRESS } from "../../constants/configEnv.js";

const API_BASE_URL = `http://${IP_ADDRESS}:3402`;

export const SignInApi = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
      },
      body: JSON.stringify({ email: email, password: password }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: "Error de conexión" + error };
  }
};
export const testConnection = async () => {
  try {
    const testResponse = await fetch(`${API_BASE_URL}`, {
      method: "GET",
    });
    console.log("Conexión exitosa:", testResponse.status);
  } catch (error) {
    console.log("Error de conexión:", error);
  }
};

export const SignUpApi = async (
  userName: string,
  name: string,
  lastName: string,
  birthDate: string,
  email: string,
  password: string,
  preference: string[],
  avatar: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
      },
      body: JSON.stringify({
        userName,
        name,
        lastName,
        birthDate,
        email,
        password,
        preference: {
          category: preference,
        },
        avatar,
      }),
    });
    if (!response.ok) {
      throw new Error("Error en la solicitud: " + response.statusText);
    }

    const data = await response.json();

    if(!Array.isArray(data)){
      return data
    }

    const allCategories = data
      .map((libro: any) => libro.category)
      .filter((category) => category !== null && category !== undefined)
      .map((category) => String(category).trim())
      .filter((category) => category !== "")
      .flatMap((category) => {
        // Divide categorías combinadas por comas
        return category.split(",").map((cat) => cat.trim());
      })
      .filter((category) => category !== ""); // Filtra nuevamente por si hay strings vacíos después del split

    // Elimina duplicados y ordena
    const categorias: string[] = [...new Set(allCategories)].sort();
    return categorias;
  } catch (error) {
    throw error;
  }
};
export const getUserData = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/oneUser`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-client": "mobile",
      },
    });
    if (!response.ok) {
      throw new Error("Error en la solicitud: " + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCategories: () => Promise<string[]> = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/booksSubgenres`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
        
      },
    });
    if (!response.ok) {
      throw new Error("Error en la solicitud: " + response.statusText);
    }
    const data: any[] = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};
export interface AvatarData {
  url_secura: string;
  id_image: string;
}

export interface AvatarResponse {
  _id: string;
  gender: string;
  avatars: AvatarData;
  __v: number;
}
export const getAvatar: () => Promise<AvatarResponse[]> = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAvatars`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client": "mobile",
      },
    });
    if (!response.ok) {
      throw new Error("Error en la solicitud: " + response.statusText);
    }
    const data: AvatarResponse[] = await response.json();
    const avatars = data;
    return avatars;
  } catch (error) {
    throw error;
  }
};
