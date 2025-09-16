import { URI } from "@/constants/ip";
import * as SecureStore from "expo-secure-store";
import React, { ReactNode, useEffect, useState } from "react";
import { authContext, UserType } from "./authContext";

const ProviderContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          setIsLogin(false);
          setIsLoading(false);
          return;
        }

        const res = await fetch(`http://${URI}/getUser`, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUser(data.user_data);
        setIsLogin(true);
      } catch (error) {
        console.error("Error al verificar sesión:", error);
        setIsLogin(false);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setIsLogin(false);
    setUser(null);
  };

  return (
    <authContext.Provider
      value={{ isLogin, setIsLogin, logout, isLoading, user, setUser }}
    >
      {children}
    </authContext.Provider>
  );
};

export default ProviderContext;
