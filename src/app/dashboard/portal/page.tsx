'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/src/services/api';

interface DestaqueItem {
  id: number;
  titulo: string;
  subtitulo?: string;
  imagem_base64: string;
  link_destino?: string;
  tipo: 'CARROSSEL' | 'CARD';
  ordem: number;
  ativo: boolean;
}

export default function GestaoPortalPage() {
  const [itens, setItens] = useState<DestaqueItem[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'CARROSSEL' | 'CARD'>('TODOS');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const [form, setForm] = useState({
    titulo: '',
    subtitulo: '',
    imagem_base64: '',
    link_destino: '',
    tipo: 'CARROSSEL',
    ordem: 1,
  });

  const carregarItens = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/destaques');
      setItens(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar destaques:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarItens();
  }, []);

  const handleUploadImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, imagem_base64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imagem_base64) {
      alert('Selecione uma imagem primeiro.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/admin/portal/destaques', form);
      setForm({
        titulo: '',
        subtitulo: '',
        imagem_base64: '',
        link_destino: '',
        tipo: 'CARROSSEL',
        ordem: 1,
      });
      carregarItens();
    } catch {
      alert('Erro ao salvar imagem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExcluir = async (item: DestaqueItem) => {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir "${item.titulo}" (${item.tipo}) da página inicial?`
    );
    if (!confirmou) return;

    setDeletandoId(item.id);
    try {
      await api.delete(`/api/admin/portal/destaques/${item.id}`);
      // Atualiza a lista removendo o item instantaneamente
      setItens((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      alert('Erro ao deletar a imagem. Verifique a conexão com o servidor.');
    } finally {
      setDeletandoId(null);
    }
  };

  const itensFiltrados = itens.filter((item) => {
    if (filtroTipo === 'TODOS') return true;
    return item.tipo === filtroTipo;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Imagens e Carrossel da Home</h1>
        <p className="text-sm text-slate-500">
          Adicione novos banners ou gerencie e exclua as imagens exibidas na página inicial do portal.
        </p>
      </div>

      {/* 1. FORMULÁRIO DE UPLOAD */}
      <form onSubmit={handleSalvar} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-rose-600 uppercase tracking-wide">
          + Cadastrar Nova Imagem
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Onde Exibir? *</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-rose-500 outline-none"
            >
              <option value="CARROSSEL">🖼️ Carrossel Principal (Banner Topo)</option>
              <option value="CARD">🃏 Card Fixo (Iniciativas e Projetos)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Título *</label>
            <input
              required
              type="text"
              placeholder="Ex: Escolinha de Futebol"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subtítulo / Descrição (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Atividades esportivas para crianças"
              value={form.subtitulo}
              onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Link ao Clicar (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: /fundacao-01"
              value={form.link_destino}
              onChange={(e) => setForm({ ...form, link_destino: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ordem de Exibição</label>
            <input
              type="number"
              min={1}
              value={form.ordem}
              onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Arquivo de Imagem *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImagem}
              className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-rose-50 file:text-rose-700 file:font-semibold cursor-pointer"
            />
          </div>
        </div>

        {form.imagem_base64 && (
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 block mb-1">Pré-visualização:</span>
            <img src={form.imagem_base64} alt="Preview" className="h-32 rounded-xl border border-slate-200 object-cover" />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition shadow-xs disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Salvar Imagem na Home'}
          </button>
        </div>
      </form>

      {/* 2. LISTA ADMINISTRATIVA PARA VISUALIZAR E DELETAR IMAGENS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Imagens Cadastradas ({itensFiltrados.length})
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie os banners e cards ativos na página inicial.
            </p>
          </div>

          {/* Filtro Rápido por Tipo */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFiltroTipo('TODOS')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filtroTipo === 'TODOS' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({itens.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('CARROSSEL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filtroTipo === 'CARROSSEL' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Carrossel ({itens.filter((i) => i.tipo === 'CARROSSEL').length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('CARD')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filtroTipo === 'CARD' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cards ({itens.filter((i) => i.tipo === 'CARD').length})
            </button>
          </div>
        </div>

        {/* Tabela Responsiva de Gerenciamento */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-4 whitespace-nowrap">Miniatura</th>
                <th className="p-4 whitespace-nowrap">Título / Descrição</th>
                <th className="p-4 whitespace-nowrap">Local de Exibição</th>
                <th className="p-4 whitespace-nowrap">Ordem</th>
                <th className="p-4 whitespace-nowrap">Link</th>
                <th className="p-4 text-right whitespace-nowrap">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-rose-600 text-xs font-medium animate-pulse">
                    Carregando imagens cadastradas...
                  </td>
                </tr>
              ) : itensFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Nenhuma imagem encontrada para este filtro.
                  </td>
                </tr>
              ) : (
                itensFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 whitespace-nowrap">
                      <img
                        src={item.imagem_base64}
                        alt={item.titulo}
                        className="w-24 h-14 object-cover rounded-lg border border-slate-200 bg-slate-100"
                      />
                    </td>
                    <td className="p-4 max-w-xs">
                      <span className="font-bold text-slate-800 text-xs block truncate">
                        {item.titulo}
                      </span>
                      {item.subtitulo && (
                        <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                          {item.subtitulo}
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          item.tipo === 'CARROSSEL'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.tipo === 'CARROSSEL' ? '🖼️ Carrossel' : '🃏 Card Fixo'}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                      #{item.ordem}
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {item.link_destino || '-'}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={deletandoId === item.id}
                        onClick={() => handleExcluir(item)}
                        className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                      >
                        {deletandoId === item.id ? 'Excluindo...' : '🗑️ Deletar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}