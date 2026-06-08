// frontend/src/context/AuthContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import api, { AUTH_UNAUTHORIZED_EVENT } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADM' | 'SELLER';
  must_change_password: boolean;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  logout(): void;
}

const getInitialUser = (): User | null => {
  try {
    const storagedUser = localStorage.getItem('@AuleviNexus:user');
    const storagedToken = localStorage.getItem('@AuleviNexus:token');
    if (storagedUser && storagedToken) {
      return JSON.parse(storagedUser);
    }
  } catch (e) {
    console.error('Erro ao recuperar usuário:', e);
  }
  return null;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser());

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  async function login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    
    const { access_token, user: userResponse } = response.data;

    localStorage.setItem('@AuleviNexus:token', access_token);
    localStorage.setItem('@AuleviNexus:user', JSON.stringify(userResponse));
    setUser(userResponse);
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const response = await api.post('/auth/password/change', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    const userResponse = response.data.user;
    setUser(userResponse);
    localStorage.setItem('@AuleviNexus:user', JSON.stringify(userResponse));
  }

  function logout() {
    localStorage.removeItem('@AuleviNexus:token');
    localStorage.removeItem('@AuleviNexus:user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading: false, login, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
