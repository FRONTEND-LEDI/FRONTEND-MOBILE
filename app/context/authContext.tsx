import { createContext } from "react";

export type UserType = {
  id: string;

} | null;

export type AuthContextType = {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  user: UserType;
  setUser: (user: UserType) => void;
};

export const authContext = createContext<AuthContextType>({
  isLogin: false,
  setIsLogin: () => {},
  logout: async () => {},
  isLoading: true,
  user: null,
  setUser: () => {},
});
