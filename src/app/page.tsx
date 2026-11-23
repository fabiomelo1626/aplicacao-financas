'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const apiPublica = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
});

export default function RootPage() {
  const [unidades, setUnidades] = useState<any[]>([]);
  const [carrossel, setCarrossel] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [slideAtual, setSlideAtual] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiPublica.get('/api/unidades/public/listar-ativas').catch(() => ({ data: [] })),
      apiPublica.get('/api/portal/public/destaques').catch(() => ({ data: { carrossel: [], cards: [] } })),
    ])
      .then(([resUnidades, resDestaques]) => {
        setUnidades(resUnidades.data || []);
        setCarrossel(resDestaques.data?.carrossel || []);
        setCards(resDestaques.data?.cards || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (carrossel.length <= 1) return;
    const timer = setInterval(() => {
      setSlideAtual((prev) => (prev + 1) % carrossel.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carrossel.length]);

  const proximoSlide = () => setSlideAtual((prev) => (prev + 1) % carrossel.length);
  const slideAnterior = () => setSlideAtual((prev) => (prev - 1 + carrossel.length) % carrossel.length);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* 1. CABEÇALHO DE LARGURA TOTAL */}
      <header className="bg-white border-b border-slate-200 relative w-full">
        <div className="w-full px-6 lg:px-12 py-6 flex flex-col items-center justify-center relative">

          <div className="w-full flex justify-end md:absolute md:right-12 md:top-6 mb-4 md:mb-0">
            <Link
              href="/login"
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            >
              🔒 Área Restrita
            </Link>
          </div>

          <div className="w-24 h-24 rounded-full bg-white border-2 border-rose-200 shadow-sm overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Instituto Viver Bem"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-3 text-center">
            Instituto Viver Bem
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 text-center max-w-xl">
            Acompanhe nossas ações e realize pagamentos ou contribuições via Pix e Transferência.
          </p>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL PREENCHENDO TODA A TELA (SEM LIMITE CENTRALIZADO) */}
      <main className="w-full px-6 lg:px-12 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* COLUNA ESQUERDA (3 colunas): ENCOSTADA NA MARGEM ESQUERDA */}
          <aside className="lg:col-span-3 bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-5 lg:sticky lg:top-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0"></span>
                Doe para o nosso Projeto
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Selecione a unidade para acessar o QR Code Pix e dados bancários:
              </p>
            </div>

            {loading ? (
              <p className="text-center text-xs text-rose-600 font-medium animate-pulse py-6">
                Carregando unidades...
              </p>
            ) : unidades.length === 0 ? (
              <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 text-center">
                Nenhuma unidade ativa configurada.
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                {unidades.map((u) => (
                  <Link
                    key={u.id}
                    href={`/${u.nome_filial}`}
                    className="w-full p-3.5 border border-slate-200 hover:border-rose-500 rounded-xl hover:bg-rose-50/40 transition flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {u.logo_url ? (
                        <img
                          src={u.logo_url}
                          alt={u.nome_exibicao}
                          className="h-9 w-9 object-contain rounded-lg border border-slate-100 bg-white p-1 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.nome_exibicao.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-bold text-slate-800 text-sm block truncate group-hover:text-rose-700 transition">
                          {u.nome_exibicao}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Pix e TED
                        </span>
                      </div>
                    </div>

                    <span className="text-xs bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white px-2.5 py-1.5 rounded-lg transition font-bold shrink-0 ml-2">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </aside>

          {/* COLUNA DIREITA (9 colunas): CARROSSEL AMPLO + 3 CARDS POR LINHA */}
          <div className="lg:col-span-9 space-y-8">

            {/* CARROSSEL DE DESTAQUES */}
            {carrossel.length > 0 && (
              <section className="relative w-full h-72 sm:h-96 md:h-[460px] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-900 group">
                {/* Camada de fundo desfocada para preencher laterais sem deixar barras pretas */}
                <img
                  src={carrossel[slideAtual].imagem_base64}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
                />

                {/* Imagem principal ajustada por completo sem cortes */}
                <img
                  src={carrossel[slideAtual].imagem_base64}
                  alt={carrossel[slideAtual].titulo}
                  className="relative z-10 w-full h-full object-contain transition-all duration-500"
                />

                <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent flex flex-col justify-end p-6 md:p-10 text-white pointer-events-none">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                    Destaque
                  </span>
                  <h2 className="text-2xl md:text-4xl font-bold max-w-3xl drop-shadow-xs">
                    {carrossel[slideAtual].titulo}
                  </h2>
                  {carrossel[slideAtual].subtitulo && (
                    <p className="text-xs md:text-base text-slate-200 mt-2 max-w-2xl drop-shadow-xs">
                      {carrossel[slideAtual].subtitulo}
                    </p>
                  )}
                  {carrossel[slideAtual].link_destino && (
                    <Link
                      href={carrossel[slideAtual].link_destino}
                      className="mt-4 inline-block w-fit bg-rose-600 hover:bg-rose-700 text-white text-xs md:text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm pointer-events-auto"
                    >
                      Acessar →
                    </Link>
                  )}
                </div>

                {carrossel.length > 1 && (
                  <>
                    <button
                      onClick={slideAnterior}
                      className="absolute z-30 left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition shadow-md"
                    >
                      ‹
                    </button>
                    <button
                      onClick={proximoSlide}
                      className="absolute z-30 right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition shadow-md"
                    >
                      ›
                    </button>
                    <div className="absolute z-30 bottom-4 right-6 flex gap-2">
                      {carrossel.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSlideAtual(idx)}
                          className={`h-2 rounded-full transition-all ${idx === slideAtual ? 'w-7 bg-rose-500' : 'w-2 bg-white/60'
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {/* CARDS FIXOS / INICIATIVAS E PROJETOS (3 colunas preenchidas) */}
            {cards.length > 0 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    Nossas Iniciativas e Projetos
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Conheça as atividades e ações apoiadas pelo instituto
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cards.map((card) => {
                    const CardBox = (
                      <div className="bg-white border border-slate-200 hover:border-rose-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition h-full flex flex-col group">
                        <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                          {/* Fundo sutil desfocado para evitar bordas vazias bruscas */}
                          <img
                            src={card.imagem_base64}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover blur-xl opacity-25 scale-110 pointer-events-none"
                          />
                          <img
                            src={card.imagem_base64}
                            alt={card.titulo}
                            className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition duration-300"
                          />
                        </div>
                      </div>
                    );

                    return card.link_destino ? (
                      <Link key={card.id} href={card.link_destino}>
                        {CardBox}
                      </Link>
                    ) : (
                      <div key={card.id}>{CardBox}</div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        </div>
      </main>

      {/* RODAPÉ DE LARGURA TOTAL */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 w-full">
        <div className="w-full px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Instituto Viver Bem — Todos os direitos reservados.</span>
          <Link href="/login" className="text-slate-500 hover:text-rose-600 font-medium transition">
            Acesso Administrativo
          </Link>
        </div>
      </footer>
    </div>
  );
}