'use client';

import React from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

export function DashboardHeader() {
  const handleLogout = () => {
    Cookies.remove('token', { path: '/' });
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Topo Esquerda: Voltar + Sair (no mobile fica na mesma linha) */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <Link
            href="/"
            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-xs shrink-0"
          >
            ← Voltar ao Início
          </Link>

          <button
            onClick={handleLogout}
            className="sm:hidden text-xs text-slate-500 hover:text-rose-600 font-semibold transition"
          >
            Sair da Conta
          </button>
        </div>

        {/* Navegação com scroll horizontal suave no mobile */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 transition whitespace-nowrap"
          >
            Painel Principal
          </Link>
          <Link
            href="/dashboard/recebimento"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 transition whitespace-nowrap"
          >
            Recebimentos
          </Link>
          <Link
            href="/dashboard/unidades"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 transition whitespace-nowrap"
          >
            Unidades / Filiais
          </Link>
          <Link
            href="/dashboard/portal"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 transition whitespace-nowrap"
          >
            Imagens / Banners
          </Link>
        </nav>

        {/* Botão Sair no Desktop */}
        <button
          onClick={handleLogout}
          className="hidden sm:block text-xs text-slate-500 hover:text-rose-600 font-semibold transition shrink-0"
        >
          Sair da Conta
        </button>
      </div>
    </header>
  );
}