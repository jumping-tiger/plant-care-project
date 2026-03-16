import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSecureItem, setSecureItem, deleteSecureItem } from '../services/secureStorage';
import { STORAGE_KEYS } from '../constants';
import { api } from '../services/api';
import type { User, LoginRequest, RegisterRequest } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

import React from 'react';

const initialState: AuthState = { user: null, token: null, isLoading: true, isLoggedIn: false };

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function useAuthProvider(): AuthContextType {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    (async () => {
      try {
        const token = await getSecureItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (token && userData) {
          setState({ user: JSON.parse(userData), token, isLoading: false, isLoggedIn: true });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (req: LoginRequest) => {
    const response = await api.login(req);
    if (response.success && response.data) {
      const { user, token } = response.data;
      await setSecureItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      setState({ user, token, isLoading: false, isLoggedIn: true });
    } else {
      throw new Error(response.error || '登录失败');
    }
  }, []);

  const register = useCallback(async (req: RegisterRequest) => {
    const response = await api.register(req);
    if (!response.success) throw new Error(response.error || '注册失败');
  }, []);

  const logout = useCallback(async () => {
    await deleteSecureItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setState({ user: null, token: null, isLoading: false, isLoggedIn: false });
  }, []);

  const updateUser = useCallback(async (user: User) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    setState(prev => ({ ...prev, user }));
  }, []);

  return { ...state, login, register, logout, updateUser };
}
