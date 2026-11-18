// src/app/(auth)/primeiro-acesso/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

export default function PrimeiroAcessoPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!username.trim()) {
      setErro('Informe o nome de usuário (username).');
      return;
    }

    if (newPassword.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErro('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (oldPassword === newPassword) {
      setErro('A nova senha deve ser diferente da senha temporária atual.');
      return;
    }

    setSubmitting(true);

    try {
      // Payload exatamente como esperado pelo FirstPassword schema do FastAPI
      const payload = {
        username: username.trim(),
        old_password: oldPassword,
        new_password: newPassword,
      };

      // Dispara o PUT na rota @user.put("/primeiro-acesso")
      await api.put('/api/primeiro-acesso', payload);

      setSucesso(true);

      // Redireciona para o Dashboard após alterar a senha com sucesso
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Erro no primeiro acesso:', error);
      const detail = error.response?.data?.detail;
      setErro(
        typeof detail === 'string'
          ? detail
          : 'Não foi possível redefinir a senha. Verifique a senha atual.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mx-auto">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Primeiro Acesso</h1>
          <p className="text-sm text-slate-500">
            Por razões de segurança, você precisa alterar sua senha temporária para continuar.
          </p>
        </div>

        {sucesso ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center space-y-2">
            <p className="font-bold text-base">✓ Senha alterada com sucesso!</p>
            <p className="text-xs text-emerald-600">Entrando no sistema...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-medium">
                ⚠️ {erro}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usuário / Username *
              </label>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu username"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Senha Atual (Temporária) *
              </label>
              <input
                required
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Digite a senha atual"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova Senha *
              </label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Nova Senha *
              </label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-md transition disabled:opacity-50 mt-2"
            >
              {submitting ? 'Alterando Senha...' : 'Salvar Nova Senha'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                ← Sair da Conta
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
