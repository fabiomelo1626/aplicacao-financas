'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/src/services/api';

export default function GestaoUnidadesPage() {
  const [unidades, setUnidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberta, setModalAberta] = useState(false);

  const [form, setForm] = useState({
    slug: '',
    nome_exibicao: '',
    razosocial: '',
    cnpj: '',
    chave_pix: '',
    banco: '',
    agencia: '',
    conta: '',
    titular: '',
    qr_code_base64: '',
    logo_url: '',
  });

  const carregarUnidades = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/unidades');
      setUnidades(res.data);
    } catch (err) {
      console.error('Erro ao carregar unidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUnidades();
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/unidades', form);
      setModalAberta(false);
      setForm({
        slug: '',
        nome_exibicao: '',
        razosocial: '',
        cnpj: '',
        chave_pix: '',
        banco: '',
        agencia: '',
        conta: '',
        titular: '',
        qr_code_base64: '',
        logo_url: '',
      });
      carregarUnidades();
    } catch {
      alert('Erro ao salvar unidade.');
    }
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, logo_url: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleUploadQRCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, qr_code_base64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Unidades Recebedoras / Filiais</h1>
          <p className="text-sm text-slate-500">Gerencie a identidade visual e dados de pagamento de cada unidade.</p>
        </div>
        <button
          onClick={() => setModalAberta(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-xs"
        >
          + Nova Unidade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-rose-600 font-medium animate-pulse">Carregando...</p>
        ) : (
          unidades.map((u) => (
            <div key={u.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800">{u.nome_exibicao}</h3>
                  <span className="text-xs text-rose-600 font-mono">/{u.slug}</span>
                </div>
                {u.logo_url && <img src={u.logo_url} alt="Logo" className="h-8 object-contain" />}
              </div>

              <div className="text-xs text-slate-500 space-y-1 border-t pt-2">
                <p><strong>CNPJ:</strong> {u.cnpj}</p>
                <p><strong>Pix:</strong> {u.chave_pix || 'Não cadastrada'}</p>
                <p><strong>Banco:</strong> {u.banco} | <strong>Ag:</strong> {u.agencia} | <strong>CC:</strong> {u.conta}</p>
              </div>

              {u.qr_code_base64 && (
                <div className="pt-2 border-t flex justify-center">
                  <img src={u.qr_code_base64} alt="QR Code" className="w-24 h-24 border p-1 rounded-lg" />
                </div>
              )}

              <a
                href={`/${u.slug}`}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs font-semibold text-rose-600 hover:underline pt-2"
              >
                Abrir Checkout Público ↗
              </a>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro */}
      {modalAberta && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800">Cadastrar Unidade Recebedora</h2>

            <form onSubmit={handleSalvar} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nome de Exibição *</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Filial Maceió"
                  value={form.nome_exibicao}
                  onChange={(e) => setForm({ ...form, nome_exibicao: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Slug da URL (minúsculo, sem espaço) *</label>
                <input
                  required
                  type="text"
                  placeholder="ex: maceio"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Razão Social</label>
                  <input
                    type="text"
                    value={form.razosocial}
                    onChange={(e) => setForm({ ...form, razosocial: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">CNPJ *</label>
                  <input
                    required
                    type="text"
                    value={form.cnpj}
                    onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Logo da Unidade</label>
                <input type="file" accept="image/*" onChange={handleUploadLogo} className="w-full text-slate-500" />
                {form.logo_url && (
                  <img src={form.logo_url} alt="Preview Logo" className="h-10 mt-2 object-contain" />
                )}
              </div>

              <hr className="border-slate-200" />
              <h3 className="font-bold text-rose-600 text-xs">⚡ Configurações do Pix</h3>

              <div>
                <label className="block font-semibold mb-1">Chave Pix</label>
                <input
                  type="text"
                  placeholder="CNPJ, E-mail, Telefone ou Aleatória"
                  value={form.chave_pix}
                  onChange={(e) => setForm({ ...form, chave_pix: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Imagem do QR Code Pix</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadQRCode}
                  className="w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-rose-50 file:text-rose-700"
                />
                {form.qr_code_base64 && (
                  <div className="mt-2 text-center">
                    <span className="text-[10px] text-slate-400 block mb-1">Pré-visualização:</span>
                    <img src={form.qr_code_base64} alt="Preview QR Code" className="w-28 h-28 border p-1 rounded-lg mx-auto bg-white" />
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />
              <h3 className="font-bold text-slate-700 text-xs">🏦 Configurações Bancárias (TED / Depósito)</h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Banco</label>
                  <input
                    type="text"
                    value={form.banco}
                    onChange={(e) => setForm({ ...form, banco: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Titular da Conta</label>
                  <input
                    type="text"
                    value={form.titular}
                    onChange={(e) => setForm({ ...form, titular: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Agência</label>
                  <input
                    type="text"
                    value={form.agencia}
                    onChange={(e) => setForm({ ...form, agencia: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Conta com Dígito</label>
                  <input
                    type="text"
                    value={form.conta}
                    onChange={(e) => setForm({ ...form, conta: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAberta(false)}
                  className="px-4 py-2 border rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition shadow-xs">
                  Salvar Unidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}