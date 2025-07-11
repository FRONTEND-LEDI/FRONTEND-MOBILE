export const SignInApi = async (email: string, password: string) => {
    try {
        const response = await fetch("http://192.168.0.20:3402/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client": "mobile"
            },
            body: JSON.stringify({ email: email, password: password }),
        });  
        const data = await response.json();
        console.log("data",data)
        return data;
    } catch (error) {
        return { error: "Error de conexión" + error };
    }
}

export const SignUpApi = async (
  userName: string,  
  name: string,
  lastName: string,
  birthDate: string,
  email: string,
  password: string
) => {
  try {
    const response = await fetch("http://192.168.0.20:3402/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      
      },
      body: JSON.stringify({
        userName, 
        name,
        lastName,
        birthDate,
        email,
        password
      }),
    });

    const data = await response.json();
    console.log("info enviada", data);
    return data;
  } catch (error) {
    throw error;
  }
};
