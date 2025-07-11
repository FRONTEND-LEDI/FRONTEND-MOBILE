export const getBooks = async () => {
  try {
    const response = await fetch("http://10.254.199.150:3402/books", {
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
    console.error("Error en getBooks:", error);
    throw error;
  }
};

export const getBookById = async (id: string) => {
  try {
    const response = await fetch(`http://10.254.199.150:3402/book/${id}`, {
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
    console.error("Error en getBookById:", error);
    throw error;
  }
};
