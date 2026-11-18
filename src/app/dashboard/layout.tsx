'use client';

import React from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    Cookies.remove('token', { path: '/' });
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Cabeçalho Fixo do Painel */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Botão de Retorno ao Menu Inicial / Portal */}
            <Link
              href="/"
              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-xs"
            >
              ← Voltar ao Início
            </Link>

            <span className="text-slate-300">|</span>

            {/* Menu Principal de Navegação */}
            <nav className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 transition"
              >
                Painel Principal
              </Link>
              <Link
                href="/dashboard/recebimento"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 transition"
              >
                Recebimentos
              </Link>
              <Link
                href="/dashboard/unidades"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 transition"
              >
                Unidades / Filiais
              </Link>
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-rose-600 font-semibold transition"
          >
            Sair da Conta
          </button>
        </div>
      </header>

      {/* Conteúdo das Páginas */}
      <main className="flex-1">{children}</main>
    </div>
  );
}