// src/components/charts/AtendimentosPorTipoChart.tsx
'use client';

import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Registra os módulos necessários do Chart.js
ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Props {
    dados: { tipo: string; total: number }[];
    tipoGrafico?: 'doughnut' | 'bar';
}

export function AtendimentosPorTipoChart({ dados, tipoGrafico = 'doughnut' }: Props) {
    const labels = dados.map((d) => d.tipo);
    const valores = dados.map((d) => d.total);

    const colors = [
        '#6366f1', // Indigo
        '#3b82f6', // Blue
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ec4899', // Pink
        '#8b5cf6', // Purple
    ];

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Quantidade de Atendimentos',
                data: valores,
                backgroundColor: colors.slice(0, dados.length),
                borderWidth: 1,
                borderRadius: tipoGrafico === 'bar' ? 6 : 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    font: { size: 12 },
                    boxWidth: 12,
                },
            },
        },
    };

    return (
        <div className="w-full h-64 flex items-center justify-center">
            {dados.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhum dado registrado para exibição.</p>
            ) : tipoGrafico === 'doughnut' ? (
                <Doughnut data={chartData} options={options} />
            ) : (
                <Bar data={chartData} options={options} />
            )}
        </div>
    );
}