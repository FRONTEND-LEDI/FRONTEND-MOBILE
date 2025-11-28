import { createContext } from "react";

export interface UserPreference {
  category: string[];
  format: string[];
  _id: string;
}

export interface LevelInfo {
  level: number;
  maxPoint: number;
  img?: {
    url_secura?: string;
  };
}

export interface AvatarInfo {
  avatars?: {
    url_secura?: string;
  };
}

export type UserType = {
  _id: string;
  name: string;
  lastName: string;
  userName: string;
  birthDate: string;
  email: string;
  password?: string;
  nivel: string;
  level?: LevelInfo | string;
  imgLevel?: string;
  rol: string;
  avatar?: string | AvatarInfo;
  preference: UserPreference;
  medals: any[];
  point?: number;
  createdAt?: string;
  updatedAt?: string;
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
