// src/app/(auth)/selecionar-local/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { LocalAcesso } from '@/src/types';

export default function SelecionarLocalPage() {
  const router = useRouter();
  const { user, locais, selecionarLocal } = useAuth();

  const handleEscolherLocal = (local: LocalAcesso) => {
    selecionarLocal(local);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">Selecione o Local de Acesso</h1>
          <p className="text-xs text-slate-500">
            Olá <span className="font-semibold text-slate-700">{user?.fullname || user?.username}</span>, escolha abaixo em qual local deseja operar nesta sessão:
          </p>
        </div>

        {/* Grid de Locais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {locais.map((local) => (
            <div
              key={local.id}
              onClick={() => handleEscolherLocal(local)}
              className="group border border-slate-200 rounded-xl p-5 hover:border-indigo-600 hover:bg-indigo-50/40 cursor-pointer transition shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Local #{local.id}
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-indigo-600 transition">
                    Entrar →
                  </span>
                </div>
                <h2 className="font-bold text-slate-800 text-base group-hover:text-indigo-900 transition">
                  {local.nome}
                </h2>
                <p className="text-xs text-slate-500">
                  {local.Cidade}/{local.Estado}
                </p>
              </div>
            </div>
          ))}

          {locais.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-400 text-sm">
              Nenhum local de acesso vinculado ao seu usuário. Entre em contato com o administrador.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}