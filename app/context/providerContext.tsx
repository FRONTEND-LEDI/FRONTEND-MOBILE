import * as SecureStore from "expo-secure-store";
import React, { ReactNode, useEffect, useState } from "react";
import { authContext } from "./authContext";

const ProviderContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("token");

        if (!storedToken) {
          setIsLogin(false);
          setToken(null);
          setUser(null);
          return;
        }

        // Si hay un token, intentar validarlo con el backend
        const res = await fetch("http://192.168.0.20:3402/getUser", {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${storedToken}`,
          },
        });

        const data = await res.json();
        console.log("AAAAAAAAAA", data);
        if (data && (data.user_data || data.user)) {
          setIsLogin(true);
          setToken(storedToken);
          setUser(data.user_data || data.user);
        } else {
          setIsLogin(false);
          setToken(storedToken);
          setUser(null);
          console.warn(
            "ProviderContext: No se encontró user_data ni user en la respuesta de /getUser"
          );
        }
      } catch (error) {
        console.error("ProviderContext: Error al verificar sesión:", error);
        setIsLogin(false);
        setToken(null);
        setUser(null);
        await SecureStore.deleteItemAsync("token");
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);
  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setIsLogin(false);
    setToken(null);
    setUser(null);
  };

  return (
    <authContext.Provider
      value={{ isLogin, setIsLogin, logout, isLoading, token, user }}
    >
      {children}
    </authContext.Provider>
  );
};

export default ProviderContext;
