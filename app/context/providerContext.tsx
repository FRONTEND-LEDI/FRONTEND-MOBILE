import * as SecureStore from "expo-secure-store";
import React, { ReactNode, useEffect, useState } from "react";
import { authContext } from "./authContext";

const ProviderContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Empieza en true, ya que está cargando el estado de autenticación

  useEffect(() => {
    const getData = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        console.log("ProviderContext: Token recuperado:", token);

        if (!token) {
          setIsLogin(false); // No hay token, no está logueado
          return;
        }

        // Si hay un token, intentar validarlo con el backend

        const res = await fetch("http://10.254.199.150:3402/getUser", {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("ProviderContext: Datos recibidos de /getUser:", data);

       
        setIsLogin(true);
       
      } catch (error) {
        console.error("ProviderContext: Error al verificar sesión:", error);
        setIsLogin(false);
        await SecureStore.deleteItemAsync("token");
      } finally {
        setIsLoading(false); 
      }
    };

    getData();
  }, []);
 console.log(isLoading)
  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setIsLogin(false); 
  };

  return (
    <authContext.Provider value={{ isLogin, setIsLogin, logout, isLoading }}>
      {children}
    </authContext.Provider>
  );
};

export default ProviderContext;
