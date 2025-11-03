import { createContext } from "react";

export type UserType = {
  _id: string;
  name: string;
  lastName: string;
  userName: string;
  birthDate?: string;
  email: string;
  password?: string;
  nivel?: string;
  rol?: string;
  avatar?: null | {
    _id?: string;
    gender?: "female" | "male" | "other" | string;
    __v?: number;
    avatars?: {
      url_secura?: string;
    };
  };
  preference?: {
    category?: string[];
    format?: string[];
    _id?: string;
  };
  __v?: number;
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
