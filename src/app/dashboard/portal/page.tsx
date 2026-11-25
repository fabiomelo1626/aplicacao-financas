'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/src/services/api';

interface DestaqueItem {
  id: number;
  titulo: string;
  subtitulo?: string;
  imagem_base64: string;
  tipo_midia?: 'IMAGEM' | 'VIDEO';
  link_destino?: string;
  tipo: 'CARROSSEL' | 'CARD';
  ordem: number;
  ativo: boolean;
}

interface NovaMidiaLote {
  tempId: string;
  arquivo: File;
  previewUrl: string;
  tipoMidia: 'IMAGEM' | 'VIDEO';
  titulo: string;
  subtitulo: string;
  link_destino: string;
  tipo: 'CARROSSEL' | 'CARD';
  ordem: number;
}

export default function GestaoPortalPage() {
  const [itens, setItens] = useState<DestaqueItem[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'CARROSSEL' | 'CARD'>('TODOS');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const [tipoPadrao, setTipoPadrao] = useState<'CARROSSEL' | 'CARD'>('CARROSSEL');
  const [linkPadrao, setLinkPadrao] = useState('');
  const [filaUpload, setFilaUpload] = useState<NovaMidiaLote[]>([]);

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

  // Libera memória das URLs temporárias ao desmontar
  useEffect(() => {
    return () => {
      filaUpload.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [filaUpload]);

  const handleUploadMultiplo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const ordemBase = itens.filter((i) => i.tipo === tipoPadrao).length + filaUpload.length + 1;
    const novas: NovaMidiaLote[] = [];

    files.forEach((file, index) => {
      const isVideo = file.type.startsWith('video/');

      if (isVideo && file.size > 15 * 1024 * 1024) {
        alert(`O vídeo "${file.name}" ultrapassa o limite de 15 MB e foi ignorado.`);
        return;
      }

      const tituloSugerido = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();

      novas.push({
        tempId: `${Date.now()}-${index}`,
        arquivo: file,
        previewUrl: URL.createObjectURL(file),
        tipoMidia: isVideo ? 'VIDEO' : 'IMAGEM',
        titulo: tituloSugerido || `Destaque ${ordemBase + index}`,
        subtitulo: '',
        link_destino: linkPadrao,
        tipo: tipoPadrao,
        ordem: ordemBase + index,
      });
    });

    setFilaUpload((prev) => [...prev, ...novas]);
    e.target.value = '';
  };

  const atualizarItemFila = (tempId: string, campo: keyof NovaMidiaLote, valor: string | number) => {
    setFilaUpload((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [campo]: valor } : item))
    );
  };

  const removerItemFila = (tempId: string) => {
    setFilaUpload((prev) => {
      const alvo = prev.find((i) => i.tempId === tempId);
      if (alvo) URL.revokeObjectURL(alvo.previewUrl);
      return prev.filter((item) => item.tempId !== tempId);
    });
  };

  const handleSalvarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filaUpload.length === 0) {
      alert('Selecione pelo menos uma imagem ou vídeo primeiro.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      filaUpload.forEach((item) => {
        formData.append('arquivos', item.arquivo);
        formData.append('titulos', item.titulo.trim() || 'Destaque');
        formData.append('subtitulos', item.subtitulo.trim());
        formData.append('links_destino', item.link_destino.trim());
        formData.append('tipos', item.tipo);
        formData.append('ordens', String(item.ordem));
      });

      await api.post('/api/admin/portal/destaques/upload-lote', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      filaUpload.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setFilaUpload([]);
      setLinkPadrao('');
      await carregarItens();
      alert('Mídias cadastradas com sucesso!');
    } catch (err: any) {
      const detalhe = err?.response?.data?.detail || 'Erro ao enviar as mídias. Verifique o tamanho dos arquivos.';
      alert(detalhe);
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
      setItens((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      alert('Erro ao deletar o item. Verifique a conexão com o servidor.');
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
        <h1 className="text-2xl font-bold text-slate-800">Imagens, Vídeos e Carrossel da Home</h1>
        <p className="text-sm text-slate-500">
          Selecione 5 ou mais imagens ou vídeos curtos (.mp4 / .webm) de uma vez para exibir na página inicial.
        </p>
      </div>

      {/* 1. FORMULÁRIO DE UPLOAD MÚLTIPLO */}
      <form onSubmit={handleSalvarLote} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-rose-600 uppercase tracking-wide">
          + Cadastrar Imagens ou Vídeos em Lote
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Onde Exibir (Padrão do Lote) *</label>
            <select
              value={tipoPadrao}
              onChange={(e) => setTipoPadrao(e.target.value as 'CARROSSEL' | 'CARD')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-rose-500 outline-none"
            >
              <option value="CARROSSEL">🖼️ Carrossel Principal (Banner Topo)</option>
              <option value="CARD">🃏 Card Fixo (Iniciativas e Projetos)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Link Padrão ao Clicar (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: /maceio"
              value={linkPadrao}
              onChange={(e) => setLinkPadrao(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Selecionar Arquivos (5 ou mais) *</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              multiple
              onChange={handleUploadMultiplo}
              disabled={submitting}
              className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-rose-50 file:text-rose-700 file:font-semibold cursor-pointer"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Segure <strong>Ctrl</strong> ou <strong>Shift</strong> para selecionar 5 ou mais arquivos de uma vez. Vídeos devem estar em <strong>.mp4</strong> ou <strong>.webm</strong> (máx. 15 MB por vídeo).
        </p>

        {/* PRÉ-VISUALIZAÇÃO DO LOTE */}
        {filaUpload.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {filaUpload.length} {filaUpload.length === 1 ? 'arquivo selecionado' : 'arquivos selecionados'} para envio:
              </span>
              <button
                type="button"
                onClick={() => setFilaUpload([])}
                className="text-xs text-slate-400 hover:text-rose-600 font-medium transition"
              >
                Limpar seleção
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filaUpload.map((item) => (
                <div
                  key={item.tempId}
                  className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 space-y-2.5 relative"
                >
                  <button
                    type="button"
                    onClick={() => removerItemFila(item.tempId)}
                    title="Remover desta fila"
                    className="absolute z-10 top-2 right-2 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-rose-600 text-xs font-bold shadow-2xs"
                  >
                    ✕
                  </button>

                  <div className="h-32 w-full rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center">
                    {item.tipoMidia === 'VIDEO' ? (
                      <video
                        src={item.previewUrl}
                        muted
                        loop
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt={item.titulo}
                        className="w-full h-full object-contain bg-slate-200"
                      />
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Título *</label>
                      <input
                        required
                        type="text"
                        value={item.titulo}
                        onChange={(e) => atualizarItemFila(item.tempId, 'titulo', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Subtítulo (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Descrição curta"
                        value={item.subtitulo}
                        onChange={(e) => atualizarItemFila(item.tempId, 'subtitulo', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Local</label>
                        <select
                          value={item.tipo}
                          onChange={(e) => atualizarItemFila(item.tempId, 'tipo', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                        >
                          <option value="CARROSSEL">Carrossel</option>
                          <option value="CARD">Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Ordem</label>
                        <input
                          type="number"
                          min={1}
                          value={item.ordem}
                          onChange={(e) => atualizarItemFila(item.tempId, 'ordem', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Link (Opcional)</label>
                      <input
                        type="text"
                        placeholder="/maceio"
                        value={item.link_destino}
                        onChange={(e) => atualizarItemFila(item.tempId, 'link_destino', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2.5 rounded-lg text-xs transition shadow-xs disabled:opacity-50"
              >
                {submitting
                  ? `Enviando ${filaUpload.length} arquivo(s)...`
                  : `Salvar ${filaUpload.length} ${filaUpload.length === 1 ? 'Arquivo' : 'Arquivos'} na Home`}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* 2. LISTA ADMINISTRATIVA PARA VISUALIZAR E DELETAR */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Mídias Cadastradas ({itensFiltrados.length})
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie os banners, vídeos e cards ativos na página inicial.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFiltroTipo('TODOS')}
              className={`px-3 py-1.5 rounded-lg transition ${filtroTipo === 'TODOS' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Todas ({itens.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('CARROSSEL')}
              className={`px-3 py-1.5 rounded-lg transition ${filtroTipo === 'CARROSSEL' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Carrossel ({itens.filter((i) => i.tipo === 'CARROSSEL').length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo('CARD')}
              className={`px-3 py-1.5 rounded-lg transition ${filtroTipo === 'CARD' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Cards ({itens.filter((i) => i.tipo === 'CARD').length})
            </button>
          </div>
        </div>

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
                    Carregando mídias cadastradas...
                  </td>
                </tr>
              ) : itensFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Nenhuma mídia encontrada para este filtro.
                  </td>
                </tr>
              ) : (
                itensFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 whitespace-nowrap">
                      {item.tipo_midia === 'VIDEO' ? (
                        <video
                          src={item.imagem_base64}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="w-24 h-14 object-contain rounded-lg border border-slate-200 bg-slate-900"
                        />
                      ) : (
                        <img
                          src={item.imagem_base64}
                          alt={item.titulo}
                          className="w-24 h-14 object-contain rounded-lg border border-slate-200 bg-slate-100"
                        />
                      )}
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
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.tipo === 'CARROSSEL'
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