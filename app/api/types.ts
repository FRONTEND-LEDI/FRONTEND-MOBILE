import { URI } from "@/constants/ip";

export const getFormats= async () => {
  try {
    const response = await fetch(`http://${URI}/booksFormats`,{

    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
    })

    const data = await  response.json()
   
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    return data
  } catch (error) {
     console.error("Error en getBySearch:", error);
    throw error;
  }
}
export const getYears = async () => {
  try {
    const response = await fetch(`http://${URI}/booksYears`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }
    const data = await response.json();
    console.log("años", data);
    return data;
  } catch (error) {
    console.error("Error en getYears:", error); 
    throw error;
  }
};
export const getSubgenres = async () => {
  try {
    const response = await fetch(`http://${URI}/booksSubgenres`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error en getSubgenres:", error);
    throw error;
  }
};