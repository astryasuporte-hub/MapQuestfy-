import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCRM } from '@/src/context/CRMContext';
import { formatBRL } from '@/src/services/formatters';
import { PageHeader, SettingsCard, StatusBadge } from '@/src/components/ui/Primitives';

type PeriodKey = 'hoje' | '7d' | '30d' | '90d' | 'custom';

const BASE_SERIES: Record<PeriodKey, { label: string; receita: number; pedidos: number; membros: number; tickets: number }[]> = {
  hoje: [
    { label: '08h', receita: 180, pedidos: 3, membros: 4, tickets: 2 },
    { label: '12h', receita: 420, pedidos: 6, membros: 9, tickets: 4 },
    { label: '16h', receita: 690, pedidos: 8, membros: 14, tickets: 3 },
    { label: '20h', receita: 510, pedidos: 5, membros: 11, tickets: 3 },
  ],
  '7d': [
    { label: 'Seg', receita: 1290, pedidos: 12, membros: 14, tickets: 5 },
    { label: 'Ter', receita: 1580, pedidos: 15, membros: 19, tickets: 7 },
    { label: 'Qua', receita: 1120, pedidos: 11, membros: 8, tickets: 4 },
    { label: 'Qui', receita: 2140, pedidos: 19, membros: 22, tickets: 6 },
    { label: 'Sex', receita: 2650, pedidos: 24, membros: 28, tickets: 8 },
    { label: 'Sáb', receita: 3120, pedidos: 27, membros: 31, tickets: 5 },
    { label: 'Dom', receita: 2480, pedidos: 21, membros: 17, tickets: 4 },
  ],
  '30d': [
    { label: 'Sem 1', receita: 8200, pedidos: 68, membros: 84, tickets: 24 },
    { label: 'Sem 2', receita: 9450, pedidos: 79, membros: 96, tickets: 29 },
    { label: 'Sem 3', receita: 11200, pedidos: 91, membros: 112, tickets: 22 },
    { label: 'Sem 4', receita: 12840, pedidos: 104, membros: 128, tickets: 19 },
  ],
  '90d': [
    { label: 'Set', receita: 29400, pedidos: 242, membros: 310, tickets: 74 },
    { label: 'Out', receita: 34800, pedidos: 289, membros: 365, tickets: 82 },
    { label: 'Nov', receita: 41690, pedidos: 342, membros: 420, tickets: 68 },
  ],
  custom: [
    { label: '01/11', receita: 1450, pedidos: 14, membros: 18, tickets: 6 },
    { label: '05/11', receita: 2380, pedidos: 20, membros: 24, tickets: 5 },
    { label: '09/11', receita: 1960, pedidos: 16, membros: 21, tickets: 4 },
    { label: '12/11', receita: 2890, pedidos: 25, membros: 29, tickets: 7 },
  ],
};

export function RelatoriosPage() {
  const { orders, customers, tickets } = useCRM();
  const [period, setPeriod] = useState<PeriodKey>('7d');
  const [customStart, setCustomStart] = useState('2026-11-01');
  const [customEnd, setCustomEnd] = useState('2026-11-12');

  const chartData = BASE_SERIES[period];

  const summary = useMemo(() => {
    const receita = chartData.reduce((s, d) => s + d.receita, 0);
    const pedidos = chartData.reduce((s, d) => s + d.pedidos, 0);
    const ticketMedio = pedidos > 0 ? receita / pedidos : 0;
    const recorrentes = customers.filter((c) => c.ordersCount > 1).length;
    return { receita, pedidos, ticketMedio, recorrentes };
  }, [chartData, customers]);

  const sourceBreakdown = useMemo(() => {
    const map: Record<string, number> = { Sharpify: 0, 'Shadow Keys': 0, 'CRM externo': 0, Manual: 0 };
    orders.forEach((o) => {
      map[o.source] = (map[o.source] || 0) + o.total;
    });
    return Object.entries(map).map(([name, valor]) => ({ name, valor }));
  }, [orders]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Relatórios e Analytics"
        subtitle="Indicadores de vendas, clientes, Discord e atendimento"
        actions={<StatusBadge label="Dados de exemplo (Modo demonstração)" tone="warning" />}
      />

      {/* Period Filters */}
      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'hoje', label: 'Hoje' },
              { id: '7d', label: '7 dias' },
              { id: '30d', label: '30 dias' },
              { id: '90d', label: '90 dias' },
              { id: 'custom', label: 'Personalizado' },
            ] as { id: PeriodKey; label: string }[]
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                period === p.id
                  ? 'bg-[#A3FF12] text-[#080B09]'
                  : 'bg-[#0B0F0C] border border-[#29332C] text-[#9DA89F] hover:text-[#F5F7F5]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-9 px-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
            />
            <span className="text-[#9DA89F]">até</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-9 px-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
            />
          </div>
        )}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4">
          <div className="text-xs text-[#9DA89F]">Receita no período (exemplo)</div>
          <div className="text-2xl font-display font-bold text-[#A3FF12] tabular-nums mt-1">
            {formatBRL(summary.receita)}
          </div>
        </div>
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4">
          <div className="text-xs text-[#9DA89F]">Pedidos no período (exemplo)</div>
          <div className="text-2xl font-display font-bold text-[#F5F7F5] tabular-nums mt-1">
            {summary.pedidos}
          </div>
        </div>
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4">
          <div className="text-xs text-[#9DA89F]">Ticket médio (exemplo)</div>
          <div className="text-2xl font-display font-bold text-[#F5F7F5] tabular-nums mt-1">
            {formatBRL(summary.ticketMedio)}
          </div>
        </div>
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4">
          <div className="text-xs text-[#9DA89F]">Clientes recorrentes / SLA 1ª resp.</div>
          <div className="text-2xl font-display font-bold text-[#36D475] tabular-nums mt-1">
            {summary.recorrentes} · 14 min
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SettingsCard title="Receita e Pedidos (Dados de exemplo)" description="Série temporal simulada no período selecionado">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="mqRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A3FF12" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#A3FF12" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#29332C" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="#9DA89F" fontSize={12} tickLine={false} />
                <YAxis stroke="#9DA89F" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111713',
                    borderColor: '#29332C',
                    borderRadius: '12px',
                    color: '#F5F7F5',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="receita"
                  name="Receita (R$)"
                  stroke="#A3FF12"
                  strokeWidth={2}
                  fill="url(#mqRevGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SettingsCard>

        <SettingsCard title="Crescimento Discord vs Tickets (Dados de exemplo)" description="Novos membros e volume de tickets por janela">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#29332C" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="#9DA89F" fontSize={12} tickLine={false} />
                <YAxis stroke="#9DA89F" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111713',
                    borderColor: '#29332C',
                    borderRadius: '12px',
                    color: '#F5F7F5',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="membros" name="Novos membros" fill="#A3FF12" radius={[6, 6, 0, 0]} />
                <Bar dataKey="tickets" name="Tickets" fill="#72A8FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SettingsCard>

        <SettingsCard title="Origem das vendas cadastradas" description="Distribuição por plataforma conectada no demo">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceBreakdown} layout="vertical">
                <CartesianGrid stroke="#29332C" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#9DA89F" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#F5F7F5" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111713',
                    borderColor: '#29332C',
                    borderRadius: '12px',
                    color: '#F5F7F5',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="valor" name="Valor (R$)" fill="#74C900" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SettingsCard>

        <SettingsCard title="Desempenho de atendimento (Amostra local)">
          <div className="space-y-3 text-xs">
            {[
              { agent: 'Ref', count: tickets.filter((t) => t.assignee === 'Ref').length, sla: '11 min' },
              { agent: 'Camila Duarte', count: tickets.filter((t) => t.assignee === 'Camila Duarte').length, sla: '16 min' },
              { agent: 'Bruno Almeida', count: tickets.filter((t) => t.assignee === 'Bruno Almeida').length, sla: '19 min' },
            ].map((row) => (
              <div
                key={row.agent}
                className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-[#F5F7F5]">{row.agent}</div>
                  <div className="text-[#9DA89F] mt-0.5">Tempo médio de 1ª resposta: {row.sla}</div>
                </div>
                <span className="font-mono text-sm font-bold text-[#A3FF12] tabular-nums">
                  {row.count} ticket(s)
                </span>
              </div>
            ))}
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
