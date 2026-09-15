import { createContext, useContext } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}
