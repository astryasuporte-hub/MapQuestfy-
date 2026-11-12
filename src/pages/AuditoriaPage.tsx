import React, { useMemo, useState } from 'react';
import { Eye, FileCode2, ShieldCheck, X } from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { AuditLog } from '@/src/types/crm';
import { formatDateTimeBR } from '@/src/services/formatters';
import { DataTable, DataTableColumn } from '@/src/components/ui/DataTable';
import {
  EmptyState,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '@/src/components/ui/Primitives';

export function AuditoriaPage() {
  const { auditLogs } = useCRM();
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('todos');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const modules = useMemo(
    () => Array.from(new Set(auditLogs.map((l) => l.module))),
    [auditLogs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auditLogs.filter((l) => {
      const mMod = moduleFilter === 'todos' || l.module === moduleFilter;
      const mQuery =
        !q ||
        l.actorName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q);
      return mMod && mQuery;
    });
  }, [auditLogs, query, moduleFilter]);

  const columns: DataTableColumn<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Data e hora',
      sortable: true,
      sortValue: (l) => l.timestamp,
      render: (l) => (
        <span className="font-mono text-xs text-[#9DA89F] tabular-nums whitespace-nowrap">
          {formatDateTimeBR(l.timestamp)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Usuário responsável',
      render: (l) => (
        <div>
          <div className="text-xs font-medium text-[#F5F7F5]">{l.actorName}</div>
          {l.actorDiscordId && (
            <div className="text-[11px] font-mono text-[#9DA89F]">{l.actorDiscordId}</div>
          )}
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Ação',
      render: (l) => <span className="text-xs font-semibold text-[#F5F7F5]">{l.action}</span>,
    },
    {
      key: 'module',
      header: 'Módulo',
      render: (l) => <StatusBadge label={l.module} tone="neutral" />,
    },
    {
      key: 'resource',
      header: 'Recurso afetado',
      render: (l) => <span className="text-xs text-[#9DA89F]">{l.resource}</span>,
    },
    {
      key: 'result',
      header: 'Resultado',
      render: (l) => (
        <StatusBadge
          label={l.result}
          tone={l.result === 'Sucesso' ? 'success' : l.result === 'Bloqueado' ? 'warning' : 'error'}
        />
      ),
    },
    {
      key: 'source',
      header: 'Origem',
      render: (l) => <span className="text-xs text-[#9DA89F]">{l.source}</span>,
    },
    {
      key: 'details',
      header: 'Detalhes',
      align: 'right',
      render: (l) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(l);
          }}
          className="p-1.5 rounded-lg text-[#9DA89F] hover:text-[#A3FF12] cursor-pointer"
          aria-label="Inspecionar evento"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Logs de Auditoria"
        subtitle="Rastreabilidade administrativa sanitizada (tokens e segredos nunca são registrados)"
      />

      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 flex items-center gap-2.5 text-xs text-[#9DA89F]">
        <ShieldCheck className="w-4 h-4 text-[#A3FF12] shrink-0" />
        <span>
          Segurança: eventos sensíveis registram apenas identificador de recurso e usuário responsável, omitindo tokens, senhas ou chaves de API.
        </span>
      </div>

      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por usuário, ação ou recurso..."
          className="w-full sm:w-80"
        />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
        >
          <option value="todos">Todos os módulos</option>
          {modules.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 sm:p-5">
        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={(l) => setSelectedLog(l)}
          emptyFallback={
            <EmptyState
              icon={<FileCode2 className="w-5 h-5" />}
              title="Nenhum registro encontrado"
              description="Tente alterar a busca ou o filtro de módulo."
            />
          }
          renderMobileCard={(l) => (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#F5F7F5]">{l.action}</span>
                <StatusBadge label={l.result} tone="success" />
              </div>
              <div className="text-[#9DA89F]">
                {l.actorName} · {l.module} · {l.resource}
              </div>
              <div className="text-[11px] font-mono text-[#9DA89F]/80">
                {formatDateTimeBR(l.timestamp)}
              </div>
            </div>
          )}
        />
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#111713] border border-[#29332C] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#F5F7F5]">
                Detalhes do Evento de Auditoria
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-[#9DA89F] hover:text-[#F5F7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs rounded-xl bg-[#0B0F0C] border border-[#29332C] p-4">
              <div className="flex justify-between">
                <span className="text-[#9DA89F]">Data/Hora:</span>
                <span className="font-mono text-[#F5F7F5]">{formatDateTimeBR(selectedLog.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9DA89F]">Responsável:</span>
                <span className="text-[#F5F7F5]">{selectedLog.actorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9DA89F]">Módulo / Ação:</span>
                <span className="text-[#A3FF12]">{selectedLog.module} · {selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9DA89F]">Recurso:</span>
                <span className="text-[#F5F7F5]">{selectedLog.resource}</span>
              </div>
              <div className="pt-2 border-t border-[#29332C]">
                <span className="text-[#9DA89F] block mb-1">Descrição sanitizada:</span>
                <p className="text-[#F5F7F5] leading-relaxed">{selectedLog.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
