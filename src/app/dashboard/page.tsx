'use client';

import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel Administrativo</h1>
        <p className="text-sm text-slate-500">
          Selecione um dos módulos abaixo para gerenciar o portal:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Card 1: Recebimentos */}
        <Link
          href="/dashboard/recebimento"
          className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-rose-500 hover:shadow-md transition space-y-3 group"
        >
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl font-bold border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition">
            📄
          </div>
          <h2 className="text-lg font-bold text-slate-800 group-hover:text-rose-600 transition">
            Conferência de Recebimentos
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Acompanhe a lista de pagamentos notificados pelas empresas pagadoras e valide o crédito com o extrato bancário.
          </p>
        </Link>

        {/* Card 2: Unidades / Filiais */}
        <Link
          href="/dashboard/unidades"
          className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-rose-500 hover:shadow-md transition space-y-3 group"
        >
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl font-bold border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition">
            🏢
          </div>
          <h2 className="text-lg font-bold text-slate-800 group-hover:text-rose-600 transition">
            Unidades / Filiais
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cadastre novas filiais, configure logos exclusivas, chaves Pix, imagens de QR Code e contas bancárias.
          </p>
        </Link>

        {/* Card 3: Imagens e Carrossel da Home */}
        <Link
          href="/dashboard/portal"
          className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-rose-500 hover:shadow-md transition space-y-3 group"
        >
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl font-bold border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition">
            🖼️
          </div>
          <h2 className="text-lg font-bold text-slate-800 group-hover:text-rose-600 transition">
            Imagens e Carrossel da Home
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Adicione ou remova banners do carrossel principal e cards informativos exibidos na página inicial.
          </p>
        </Link>
      </div>
    </div>
  );
}