'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/src/services/api';

interface EntradaItem {
  id: string;
  empresa_nome: string;
  unidade_nome: string;
  unidade_recebedora_id: number;
  valor: number;
  tipo_pagamento: number | string;
  status: number | string;
  descricao?: string;
  txid?: string;
  data_registro?: string;
}

export default function PainelRecebimentosPage() {
  const [entradas, setEntradas] = useState<EntradaItem[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [unidadeFiltro, setUnidadeFiltro] = useState<string>('TODAS');
  const [loading, setLoading] = useState(true);

  const [entradaParaValidar, setEntradaParaValidar] = useState<EntradaItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const statusMapping: Record<number, { label: string; style: string }> = {
    1: { label: 'Aguardando Validação', style: 'bg-amber-100 text-amber-800' },
    2: { label: 'Concluído', style: 'bg-emerald-100 text-emerald-800' },
    3: { label: 'Recusado', style: 'bg-rose-100 text-rose-800' },
  };

  const tipoPagamentoMapping: Record<number, string> = {
    1: 'Pix',
    2: 'TED / Depósito',
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resEntradas, resUnidades] = await Promise.all([
        api.get('/api/admin/entradas'),
        api.get('/api/admin/unidades'),
      ]);
      setEntradas(resEntradas.data);
      setUnidades(resUnidades.data);
    } catch (err) {
      console.error('Erro ao carregar recebimentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleConfirmarValidacao = async (aprovado: boolean) => {
    if (!entradaParaValidar) return;

    setSubmitting(true);
    try {
      const novoStatusId = aprovado ? 2 : 3;
      await api.patch(`/api/admin/entradas/${entradaParaValidar.id}/validar`, {
        status_id: novoStatusId,
        aprovado,
      });

      setEntradaParaValidar(null);
      carregarDados();
    } catch {
      alert('Erro ao alterar o status do pagamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const entradasFiltradas = entradas.filter((e) => {
    if (unidadeFiltro === 'TODAS') return true;
    return String(e.unidade_recebedora_id) === unidadeFiltro;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Conferência de Recebimentos</h1>
          <p className="text-sm text-slate-500">Validação manual de entradas registradas pelas empresas pagadoras.</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Filial / Unidade:</label>
          <select
            value={unidadeFiltro}
            onChange={(e) => setUnidadeFiltro(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="TODAS">Todas as Unidades</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome_exibicao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. overflow-x-auto na div externa habilita o deslize lateral no celular */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">

        {/* 2. min-w-[800px] garante que a tabela nunca seja esmagada */}
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              {/* 3. whitespace-nowrap nos cabeçalhos evita quebra de linha */}
              <th className="p-4 whitespace-nowrap">Data</th>
              <th className="p-4 whitespace-nowrap">TXID / Referência</th>
              <th className="p-4 whitespace-nowrap">Unidade Recebedora</th>
              <th className="p-4 whitespace-nowrap">Empresa Pagadora</th>
              <th className="p-4 whitespace-nowrap">Método</th>
              <th className="p-4 whitespace-nowrap">Valor</th>
              <th className="p-4 whitespace-nowrap">Status</th>
              <th className="p-4 text-right whitespace-nowrap">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-rose-600 font-medium animate-pulse">
                  Carregando recebimentos...
                </td>
              </tr>
            ) : entradasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400">
                  Nenhum recebimento registrado.
                </td>
              </tr>
            ) : (
              entradasFiltradas.map((e) => {
                const statusInfo =
                  typeof e.status === 'number'
                    ? statusMapping[e.status]
                    : { label: String(e.status), style: 'bg-slate-100 text-slate-700' };

                const tipoNome =
                  typeof e.tipo_pagamento === 'number'
                    ? tipoPagamentoMapping[e.tipo_pagamento]
                    : e.tipo_pagamento;

                const isPendente = e.status === 1 || e.status === 'AGUARDANDO_VALIDACAO';

                return (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    {/* 4. whitespace-nowrap nas células mantém datas, valores e botões alinhados */}
                    <td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {e.data_registro ? new Date(e.data_registro).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="block font-mono text-xs text-slate-700 font-semibold">
                        {e.txid || `#${e.id.slice(0, 8)}`}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 whitespace-nowrap">
                      {e.unidade_nome || 'Matriz'}
                    </td>
                    <td className="p-4 text-slate-800 font-medium whitespace-nowrap">
                      {e.empresa_nome}
                    </td>
                    <td className="p-4 text-xs text-slate-600 font-semibold whitespace-nowrap">
                      {tipoNome || 'Pix'}
                    </td>
                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                      R$ {Number(e.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo?.style}`}>
                        {statusInfo?.label}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {isPendente ? (
                        <button
                          onClick={() => setEntradaParaValidar(e)}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          Validar Entrada
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Validado</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Validação */}
      {entradaParaValidar && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-slate-800">Validar Entrada de Pagamento</h2>
              <button
                onClick={() => setEntradaParaValidar(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">TXID:</span>
                <span className="font-mono font-bold text-slate-800">{entradaParaValidar.txid || entradaParaValidar.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Empresa Pagadora:</span>
                <span className="font-semibold text-slate-800">{entradaParaValidar.empresa_nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unidade Destino:</span>
                <span className="font-semibold text-slate-800">{entradaParaValidar.unidade_nome}</span>
              </div>
              <div className="flex justify-between border-t border-rose-200/60 pt-2">
                <span className="text-slate-500">Valor Declarado:</span>
                <span className="font-bold text-slate-900 text-sm">
                  R$ {Number(entradaParaValidar.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Confira no extrato bancário da unidade se o valor acima foi creditado na conta antes de aprovar.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleConfirmarValidacao(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg text-xs transition"
              >
                Recusar Entrada
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleConfirmarValidacao(true)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-lg text-xs transition shadow-xs"
              >
                {submitting ? 'Salvando...' : 'Confirmar no Banco'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}