// src/app/(auth)/redefinir-senha/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/src/services/api';

function RedefinirSenhaForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Pega o token enviado via parâmetro da URL (?token=...)
    const token = searchParams.get('token');

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);

        if (!token) {
            setErro('Token de recuperação não fornecido ou inválido na URL.');
            return;
        }

        if (novaSenha.length < 6) {
            setErro('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas digitadas não coincidem.');
            return;
        }

        setSubmitting(true);

        try {
            // Payload exatamente como definido no ResetPasswordRequest do FastAPI
            const payload = {
                token: token,
                nova_senha: novaSenha,
            };

            await api.post('/redefinir-senha', payload);

            setSucesso(true);

            setTimeout(() => {
                router.push('/login');
            }, 2500);
        } catch (error: any) {
            console.error('Erro ao redefinir senha:', error);
            const detail = error.response?.data?.detail;
            setErro(
                typeof detail === 'string'
                    ? detail
                    : 'Token expirado ou inválido. Solicite um novo link de recuperação.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center font-bold text-xl mx-auto">
                    ⚠️
                </div>
                <h1 className="text-xl font-bold text-slate-800">Link Inválido</h1>
                <p className="text-sm text-slate-500">
                    O link para redefinição de senha está incompleto ou expirou.
                </p>
                <Link
                    href="/login"
                    className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                >
                    Voltar para o Login
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mx-auto">
                    🔒
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Criar Nova Senha</h1>
                <p className="text-sm text-slate-500">
                    Digite e confirme sua nova senha para recuperar o acesso à sua conta.
                </p>
            </div>

            {sucesso ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center space-y-2">
                    <p className="font-bold text-base">✓ Senha redefinida com sucesso!</p>
                    <p className="text-xs text-emerald-600">Redirecionando para a tela de login...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {erro && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-medium">
                            ⚠️ {erro}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Nova Senha *
                        </label>
                        <input
                            required
                            type="password"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            placeholder="Digite a nova senha"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Confirmar Nova Senha *
                        </label>
                        <input
                            required
                            type="password"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            placeholder="Repita a nova senha"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-md transition disabled:opacity-50 mt-2"
                    >
                        {submitting ? 'Salvando Nova Senha...' : 'Redefinir Senha'}
                    </button>

                    <div className="text-center pt-2">
                        <Link href="/login" className="text-xs text-slate-400 hover:text-slate-600 font-medium">
                            ← Cancelar e Voltar para o Login
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function RedefinirSenhaPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white text-sm">Carregando formulário...</div>}>
                <RedefinirSenhaForm />
            </Suspense>
        </div>
    );
}