// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, Local, LocalAcesso } from '@/src/types/index';



// 2. Tipagem do que o Contexto disponibiliza para o app
interface AuthContextType {
  user: User | null;
  token: string | null;
  locais: Local[];
  localAtivo: Local | null;
  loading: boolean;
  setAuthData: (user: User, locais: Local[], token: string) => void;
  setLocalAtivo: (local: Local) => void;
  selecionarLocal: (local: Local, novoToken: string) => void;
  logout: () => void;

}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Rotas públicas que NÃO precisam de login
const PUBLIC_ROUTES = ['/login', '/esqueci-senha', '/redefinir-senha'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [locais, setLocais] = useState<Local[]>([]);
  const [localAtivo, setLocalAtivoState] = useState<Local | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // A) Carrega dados salvos do localStorage ao iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('@app:token');
    const savedUser = localStorage.getItem('@app:user');
    const savedLocais = localStorage.getItem('@app:locais');
    const savedLocalAtivo = localStorage.getItem('@app:localAtivo');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      if (savedLocais) setLocais(JSON.parse(savedLocais));
      if (savedLocalAtivo) setLocalAtivoState(JSON.parse(savedLocalAtivo));
    }

    setLoading(false);
  }, []);

  // B) Route Guard: Bloqueia navegação sem token em páginas privadas
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!token && !isPublicRoute) {
      router.push('/login');
    }
  }, [token, pathname, loading, router]);

  // C) Função chamada no LOGIN para salvar as credenciais
  const setAuthData = (newUser: User, newLocais: Local[], newToken: string) => {
    setUser(newUser);
    setLocais(newLocais || []);
    setToken(newToken);

    localStorage.setItem('@app:token', newToken);
    localStorage.setItem('@app:user', JSON.stringify(newUser));
    localStorage.setItem('@app:locais', JSON.stringify(newLocais || []));

    // Se tiver apenas 1 local, define como ativo automaticamente
    if (newLocais && newLocais.length === 1) {
      setLocalAtivo(newLocais[0]);
    }
  };

  // D) Seleção do local ativo
  const setLocalAtivo = (local: Local) => {
    setLocalAtivoState(local);
    localStorage.setItem('@app:localAtivo', JSON.stringify(local));
  };

  const selecionarLocal = (local: Local, novoToken: string) => {
    setLocalAtivoState(local);
    setToken(novoToken);

    localStorage.setItem('@app:localAtivo', JSON.stringify(local));
    localStorage.setItem('@app:token', novoToken);
  };

  // E) LOGOUT COMPLETO: Limpa memória, localStorage e redireciona
  const logout = () => {
    setUser(null);
    setToken(null);
    setLocais([]);
    setLocalAtivoState(null);

    // Limpa todas as chaves do navegador
    localStorage.removeItem('@app:token');
    localStorage.removeItem('@app:user');
    localStorage.removeItem('@app:locais');
    localStorage.removeItem('@app:localAtivo');
    localStorage.clear();

    // Redireciona para o login
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        locais,
        localAtivo,
        loading,
        setAuthData,
        setLocalAtivo,
        logout,
        selecionarLocal,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);