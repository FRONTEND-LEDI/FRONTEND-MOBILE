import { URI } from "@/constants/ip";
import * as SecureStore from "expo-secure-store";

// ! Actualizar progreso
export const updateBookProgress = async (
  progressId: string,
  updates: {
    status: string;
    position: number;
    percent: number;
    total: number;
    unit: string;
  }
) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No se encontró el token.");

    const requestBody = {
      id: progressId,
      ...updates
    };

    

    const response = await fetch(`http://${URI}/progress`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    console.log("Actualización exitosa:", data);
    return data;
  } catch (error) {
    console.error("Error en updateBookProgress:", error);
    throw error;
  }
};

// ! Crear nuevo progreso
export const postSaveProgress = async (bookData: {
  position: number;
  percent: number;
  total: number;
  status: string;
  idBook: string;
  unit: string;
}) => {
  try {
    console.log("Buscando progreso existente para:", bookData.idBook);
    
    // ! Verificar primero si ya existe un progreso
    const existing = await getBookProgressById(bookData.idBook);
    
    if (existing && existing._id) {
      console.log("Ya existe progreso, actualizando:", existing._id);
      return await updateBookProgress(existing._id, {
        status: bookData.status,
        position: bookData.position,
        percent: bookData.percent,
        total: bookData.total,
        unit: bookData.unit,
      });
    }

    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No se encontró el token.");

    const requestBody = {
      idBook: bookData.idBook,
      status: bookData.status,
      unit: bookData.unit,
      position: bookData.position,
      percent: bookData.percent,
      total: bookData.total,
      startDate: new Date().toISOString(),
    };

    console.log("Enviando POST a /SaveProgress:", requestBody);

    const response = await fetch(`http://${URI}/SaveProgress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    console.log("Respuesta de /SaveProgress:", data);
    
    // * Manejar diferentes formatos de respuesta
    let progressData;
    
    if (data.data) {
      progressData = data.data;
    } else if (data._id || data.id) {
      progressData = data;
    } else {
      // Buscar cualquier objeto que pueda contener los datos
      const dataKeys = Object.keys(data);
      for (const key of dataKeys) {
        if (data[key] && typeof data[key] === 'object' && (data[key]._id || data[key].id)) {
          progressData = data[key];
          break;
        }
      }
      if (!progressData) progressData = data;
    }
    
    const progressId = progressData._id || progressData.id;
    
    if (progressId) {
      console.log("Nuevo progreso creado:", progressId);
      return { ...progressData, _id: progressId };
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error en postSaveProgress:", error);
    throw error;
  }
};

// ! Buscar progreso existente por ID
export const getBookProgressById = async (idBook: string) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      console.log("No token found");
      return null;
    }
    
    
    const response = await fetch(`http://${URI}/Progress`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log("Error en response:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("Respuesta de get /Progress:", data);
    
    let progressArray = [];
    
    if (Array.isArray(data)) {
      progressArray = data;
      
    } else if (data && typeof data === 'object') {
      
      
      // Buscar array en cualquier propiedad
      const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
      if (arrayKey) {
        progressArray = data[arrayKey];
        
      } else if (data.idBook) {
        progressArray = [data];
       
      } else {
        // Intentar encontrar datos en otras propiedades
        for (const key of Object.keys(data)) {
          if (data[key] && typeof data[key] === 'object') {
            if (Array.isArray(data[key])) {
              progressArray = data[key];
              break;
            } else if (data[key].idBook) {
              progressArray = [data[key]];
              break;
            }
          }
        }
      }
    }
    
    
    const progress = progressArray.find((item: any) => {
      if (!item || typeof item !== 'object') return false;
      
      const bookId = item.idBook || item.bookId || item.id;
      const found = bookId === idBook;
      if (found) console.log("Libro encontrado en progreso:", item);
      return found;
    });
    
    console.log("Resultado búsqueda:", progress ? `ENCONTRADO: ${progress._id}` : "NO ENCONTRADO");
    return progress || null;

  } catch (error) {
    console.error("Error en getBookProgressById:", error);
    return null;
  }
};

export const deleteBookProgress = async (idBook: string) => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      console.log("No token found");
      return null;
    }

    const response = await fetch(`http://${URI}/progress`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ idBook }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Respuesta de /progress:", data);
      return data;
    }
  } catch (error) {
    console.log("Error en deleteBookProgress:", error);
  }
}