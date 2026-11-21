// src/app/(auth)/esqueci-senha/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/src/services/api';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSubmitting(true);

    try {
      // Aponta diretamente para a SUA rota do FastAPI
      await api.post('/solicitar-recuperacao', { email: email.trim() });
      setEnviado(true);
    } catch (error: any) {
      console.error('Erro ao solicitar recuperação:', error);
      const detail = error.response?.data?.detail;
      setErro(
        typeof detail === 'string'
          ? detail
          : 'Não foi possível solicitar a recuperação. Verifique se o e-mail está correto.'
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
            📩
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Recuperar Senha</h1>
          <p className="text-sm text-slate-500">
            Informe seu e-mail para receber as instruções de redefinição.
          </p>
        </div>

        {enviado ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center space-y-3">
            <p className="font-bold text-base">✓ Solicitação enviada!</p>
            <p className="text-xs text-emerald-700">
              Caso o e-mail esteja cadastrado, você receberá o link para redefinir sua senha no seu sistema.
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              ← Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-medium">
                ⚠️ {erro}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Cadastrado *</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@email.com"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-slate-400 hover:text-slate-600 font-medium">
                ← Voltar para o Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
