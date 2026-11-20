'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';

const apiPublica = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500',
});

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const res = await apiPublica.post('/api/login', { username, password });
      const { access_token } = res.data;

      // Guarda o token nos cookies e no localStorage
      Cookies.set('token', access_token, { expires: 1, path: '/' });
      localStorage.setItem('token', access_token);

      // Redireciona para o painel administrativo
      window.location.href = '/dashboard';
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErro('Username ou senha incorretos.');
      } else {
        setErro('Falha ao conectar com o servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        
        {/* Topo com Botão de Retorno e Ícone */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <Link
            href="/"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
          >
            ← Voltar ao Início
          </Link>
          <span className="text-xs font-mono text-slate-400">Área Restrita</span>
        </div>

        {/* Logo Circular na Paleta Rose */}
        <div className="mx-auto w-20 h-20 bg-rose-50 border-2 border-rose-200 rounded-full overflow-hidden flex items-center justify-center shadow-xs">
          <img
            src="/logo.png"
            alt="Logo Portal"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Acesso ao Painel</h1>
          <p className="text-xs text-slate-500 mt-1">
            Informe suas credenciais para gerenciar os recebimentos
          </p>
        </div>

        {/* Alerta de Erro */}
        {erro && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
            <input
              required
              type="text"
              placeholder="seu username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha *</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition shadow-xs disabled:opacity-50 text-sm"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Apenas operadores e gestores autorizados têm acesso a este módulo.
          </p>
        </div>
      </div>
    </div>
  );
}