'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { fetchEnderecoByCEP } from '@/src/services/viacep';
import { maskCEP, maskPhone, unmaskNumber } from '@/src/utils/formatters';

const apiPublica = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500',
});

export default function CheckoutFilialPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [unidade, setUnidade] = useState<any | null>(null);
  const [loadingUnidade, setLoadingUnidade] = useState(true);

  const [etapa, setEtapa] = useState<'BUSCA' | 'CADASTRO' | 'PAGAMENTO' | 'CONCLUIDO'>('BUSCA');
  const [documento, setDocumento] = useState('');
  const [empresaPagadora, setEmpresaPagadora] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'PJ' | 'PF'>('PJ');

  const [formData, setFormData] = useState({
    RazaoSocial: '',
    NomeFantasia: '',
    CNAE: '',
    Tipo: '1',
    InscricaoEstadual: '',
    InscricaoMunicipal: '',
    Email: '',
    Telefone: '',
    Logradouro: '',
    Numero: '',
    Bairro: '',
    CEP: '',
    Cidade: '',
    Estado: '',
    ProdutosServicosFornecidos: '',
    InformacoesAdicionais: '',
    ativo: true,
  });

  const [metodo, setMetodo] = useState<'PIX' | 'TED'>('PIX');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      apiPublica
        .get(`/api/unidades/public/${slug}`)
        .then((res) => setUnidade(res.data))
        .catch(() => alert('Unidade recebedora não encontrada ou inativa.'))
        .finally(() => setLoadingUnidade(false));
    }
  }, [slug]);

  const handleBuscarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanDoc = unmaskNumber(documento);

    try {
      const res = await apiPublica.get(`/api/busca-empresa/${cleanDoc}`);
      const achou = Array.isArray(res.data) ? res.data[0] : res.data;

      if (achou && (achou.id || achou.CNPJCPF)) {
        setEmpresaPagadora(achou);
        setEtapa('PAGAMENTO');
      } else {
        setEtapa('CADASTRO');
      }
    } catch {
      setEtapa('CADASTRO');
    } finally {
      setLoading(false);
    }
  };

  const handleCadastrarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isPJ = tipoPessoa === 'PJ';
      const cleanDoc = unmaskNumber(documento);

      const payload = {
        user_id: null,
        local_id: null,
        RazaoSocial: formData.RazaoSocial || null,
        NomeFantasia: formData.NomeFantasia || null,
        CNPJCPF: cleanDoc ? parseInt(cleanDoc, 10) : 0,
        CNAE: formData.CNAE ? parseInt(unmaskNumber(formData.CNAE), 10) : null,
        Tipo: parseInt(formData.Tipo, 10) || 1,
        Logradouro: formData.Logradouro || null,
        Numero: formData.Numero || null,
        Bairro: formData.Bairro || null,
        CEP: formData.CEP ? parseInt(unmaskNumber(formData.CEP), 10) : null,
        Cidade: formData.Cidade || null,
        Estado: formData.Estado ? formData.Estado.toUpperCase() : null,
        Is_PessoaJuridico: isPJ,
        Is_PessoaFisico: !isPJ,
        Telefone: formData.Telefone ? parseInt(unmaskNumber(formData.Telefone), 10) : null,
        Email: formData.Email || null,
        InscricaoEstadual: formData.InscricaoEstadual ? parseInt(unmaskNumber(formData.InscricaoEstadual), 10) : null,
        InscricaoMunicipal: formData.InscricaoMunicipal ? parseInt(unmaskNumber(formData.InscricaoMunicipal), 10) : null,
        ProdutosServicosFornecidos: formData.ProdutosServicosFornecidos || null,
        InformacoesAdicionais: formData.InformacoesAdicionais || null,
        ativo: formData.ativo,
      };

      const res = await apiPublica.post('/api/create-empresa/', payload);
      setEmpresaPagadora(res.data);
      setEtapa('PAGAMENTO');
    } catch (error) {
      alert('Erro ao cadastrar empresa.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaPagadora || !unidade || !valor) return;

    setSubmitting(true);
    const tipoPagamentoId = metodo === 'PIX' ? 1 : 2;

    try {
      await apiPublica.post('/api/create-entrada/', {
        empresa_id: Number(empresaPagadora.id),
        unidade_recebedora_id: Number(unidade.id),
        valor: parseFloat(valor),
        tipo_pagamento_id: tipoPagamentoId,
        status_id: 1,
        descricao: descricao || `Pagamento informado via ${metodo}`,
      });

      setEtapa('CONCLUIDO');
    } catch {
      alert('Erro ao registrar o pagamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReiniciar = () => {
    setEtapa('BUSCA');
    setDocumento('');
    setValor('');
    setDescricao('');
    setEmpresaPagadora(null);
  };

  if (loadingUnidade) {
    return <div className="min-h-screen flex items-center justify-center text-rose-600 font-semibold">Carregando unidade...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4">
      {/* Topbar com Botão de Voltar ao Início */}
      <header className="max-w-4xl w-full mx-auto flex justify-between items-center py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1">
            ← Voltar ao Início
          </Link>
          <span className="text-slate-300">|</span>
          {unidade?.logo_url ? (
            <img src={unidade.logo_url} alt={unidade.nome_exibicao} className="h-8 object-contain" />
          ) : (
            <span className="font-bold text-slate-800 text-lg">{unidade?.nome_exibicao}</span>
          )}
        </div>
        <span className="text-xs text-slate-400 font-mono">CNPJ: {unidade?.cnpj}</span>
      </header>

      <main className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 my-auto space-y-6">
        
        {/* BUSCA */}
        {etapa === 'BUSCA' && (
          <form onSubmit={handleBuscarEmpresa} className="max-w-md mx-auto space-y-4 py-6">
            <h1 className="text-xl font-bold text-center text-slate-800">
              Pagamento para <span className="text-rose-600">{unidade?.nome_exibicao}</span>
            </h1>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ / CPF do Pagador *</label>
              <input
                required
                type="text"
                value={documento}
                onChange={(e) => setDocumento(unmaskNumber(e.target.value))}
                placeholder="Apenas números"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white font-semibold py-3 rounded-lg hover:bg-rose-700 transition shadow-sm"
            >
              {loading ? 'Buscando...' : 'Buscar e Continuar'}
            </button>
          </form>
        )}

        {/* CADASTRO */}
        {etapa === 'CADASTRO' && (
          <form onSubmit={handleCadastrarEmpresa} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Cadastrar Empresa / Pagador</h2>
                <p className="text-xs text-slate-500">
                  Documento: <span className="font-mono font-semibold">{documento}</span>
                </p>
              </div>
              <button type="button" onClick={() => setEtapa('BUSCA')} className="text-xs text-rose-600 hover:underline font-medium">
                Voltar à Busca
              </button>
            </div>

            <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setTipoPessoa('PJ')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  tipoPessoa === 'PJ' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                🏢 Pessoa Jurídica (PJ)
              </button>
              <button
                type="button"
                onClick={() => setTipoPessoa('PF')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  tipoPessoa === 'PF' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                👤 Pessoa Física (PF)
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">📋 Identificação Fiscal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {tipoPessoa === 'PJ' ? 'Razão Social *' : 'Nome Completo *'}
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.RazaoSocial}
                    onChange={(e) => setFormData({ ...formData, RazaoSocial: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formData.NomeFantasia}
                    onChange={(e) => setFormData({ ...formData, NomeFantasia: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {tipoPessoa === 'PJ' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Inscrição Estadual</label>
                      <input
                        type="text"
                        value={formData.InscricaoEstadual}
                        onChange={(e) => setFormData({ ...formData, InscricaoEstadual: unmaskNumber(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Inscrição Municipal</label>
                      <input
                        type="text"
                        value={formData.InscricaoMunicipal}
                        onChange={(e) => setFormData({ ...formData, InscricaoMunicipal: unmaskNumber(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CNAE (Números)</label>
                      <input
                        type="text"
                        value={formData.CNAE}
                        onChange={(e) => setFormData({ ...formData, CNAE: unmaskNumber(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.Telefone}
                    onChange={(e) => setFormData({ ...formData, Telefone: maskPhone(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formData.Email}
                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-800">📍 Endereço</h3>
                {loadingCEP && <span className="text-xs text-rose-600 animate-pulse">Buscando CEP...</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CEP</label>
                  <input
                    type="text"
                    value={formData.CEP}
                    onChange={(e) => setFormData({ ...formData, CEP: maskCEP(e.target.value) })}
                    onBlur={async () => {
                      const cleanCEP = unmaskNumber(formData.CEP);
                      if (cleanCEP.length === 8) {
                        setLoadingCEP(true);
                        const data = await fetchEnderecoByCEP(cleanCEP);
                        if (data) {
                          setFormData((prev) => ({
                            ...prev,
                            Logradouro: data.logradouro || prev.Logradouro,
                            Bairro: data.bairro || prev.Bairro,
                            Cidade: data.localidade || prev.Cidade,
                            Estado: data.uf || prev.Estado,
                          }));
                        }
                        setLoadingCEP(false);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro</label>
                  <input
                    type="text"
                    value={formData.Logradouro}
                    onChange={(e) => setFormData({ ...formData, Logradouro: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={formData.Numero}
                    onChange={(e) => setFormData({ ...formData, Numero: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={formData.Bairro}
                    onChange={(e) => setFormData({ ...formData, Bairro: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade / UF</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.Cidade}
                      onChange={(e) => setFormData({ ...formData, Cidade: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      maxLength={2}
                      type="text"
                      value={formData.Estado}
                      onChange={(e) => setFormData({ ...formData, Estado: e.target.value.toUpperCase() })}
                      className="w-16 px-3 py-2 border rounded-lg text-sm uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 text-white font-semibold py-3 rounded-lg hover:bg-rose-700 transition"
            >
              {loading ? 'Salvando...' : 'Salvar e Ir para o Pagamento'}
            </button>
          </form>
        )}

        {/* PAGAMENTO */}
        {etapa === 'PAGAMENTO' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-center">
              <span className="text-xs text-rose-500 block">Pagador</span>
              <p className="font-bold text-slate-800">{empresaPagadora?.RazaoSocial || empresaPagadora?.NomeFantasia}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMetodo('PIX')}
                className={`py-2 rounded-lg text-xs font-semibold ${
                  metodo === 'PIX' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                ⚡ Pix
              </button>
              <button
                type="button"
                onClick={() => setMetodo('TED')}
                className={`py-2 rounded-lg text-xs font-semibold ${
                  metodo === 'TED' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                🏦 Depósito / TED
              </button>
            </div>

            {metodo === 'PIX' && (
              <div className="text-center space-y-4">
                {unidade?.qr_code_base64 && (
                  <img
                    src={unidade.qr_code_base64}
                    alt="QR Code Pix"
                    className="w-52 h-52 mx-auto border border-slate-200 p-2 rounded-xl shadow-sm bg-white"
                  />
                )}
                <p className="text-xs text-slate-500 font-mono">
                  Chave Pix: <strong className="text-slate-800">{unidade?.chave_pix}</strong>
                </p>
              </div>
            )}

            {metodo === 'TED' && (
              <div className="bg-slate-50 p-4 rounded-xl border text-xs space-y-2">
                <p><strong>Banco:</strong> {unidade?.banco}</p>
                <p><strong>Agência:</strong> {unidade?.agencia} | <strong>Conta:</strong> {unidade?.conta}</p>
                <p><strong>Titular:</strong> {unidade?.titular}</p>
              </div>
            )}

            <form onSubmit={handleConfirmarPagamento} className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valor do Pagamento (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Referência (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Ref. Nota Fiscal"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {submitting ? 'Registrando...' : '✓ Já Realizei o Pagamento'}
              </button>
            </form>
          </div>
        )}

        {/* CONCLUÍDO */}
        {etapa === 'CONCLUIDO' && (
          <div className="text-center p-8 space-y-4 max-w-sm mx-auto">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold text-slate-800">Pagamento Registrado!</h2>
            <p className="text-xs text-slate-500">
              Sua notificação de pagamento foi enviada para conferência da unidade <strong>{unidade?.nome_exibicao}</strong>.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleReiniciar}
                className="w-full bg-rose-600 text-white font-semibold py-2.5 rounded-lg hover:bg-rose-700 transition text-sm shadow-sm"
              >
                Realizar Novo Pagamento
              </button>
              <Link
                href="/"
                className="block text-center w-full bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-lg hover:bg-slate-200 transition text-sm"
              >
                Voltar à Tela de Início
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400">
        © {unidade?.nome_exibicao} - Todos os direitos reservados.
      </footer>
    </div>
  );
}