import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  KeyRound,
  Plug,
  RefreshCw,
  Settings,
  X,
} from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { ADAPTER_REGISTRY } from '@/src/services/adapters';
import { IntegrationItem } from '@/src/types/crm';
import { formatDateTimeBR } from '@/src/services/formatters';
import {
  BackendHonestNotice,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SettingsCard,
  StatusBadge,
} from '@/src/components/ui/Primitives';

export function IntegracoesPage() {
  const { integrations, syncJobs, updateIntegration, pushToast } = useCRM();
  const [editing, setEditing] = useState<IntegrationItem | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const statusTone = (status: IntegrationItem['status']) => {
    if (status === 'Conectado') return 'success';
    if (status === 'Configurando' || status === 'Sincronizando') return 'info';
    if (status === 'Aguardando documentação') return 'warning';
    if (status === 'Erro') return 'error';
    return 'neutral';
  };

  const handleTest = async (item: IntegrationItem) => {
    setTestingId(item.id);
    const adapter = ADAPTER_REGISTRY[item.id];
    const res = await adapter.testConnectionDemo(item);
    setTestingId(null);
    pushToast({
      type: res.ok ? 'success' : 'info',
      title: adapter.displayName,
      description: res.message,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Central de Integrações"
        subtitle="Arquitetura extensível baseada em adapters (Discord, Sharpify, Shadow Keys e CRM externo)"
      />

      <BackendHonestNotice message="Nenhuma chave de API, token ou secret é persistida no navegador ou localStorage. Credenciais reais devem ser configuradas exclusivamente nas variáveis de ambiente do backend." />

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => {
          const adapter = ADAPTER_REGISTRY[item.id];
          return (
            <section
              key={item.id}
              className="rounded-2xl bg-[#111713] border border-[#29332C] p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#171D18] border border-[#29332C] flex items-center justify-center text-[#A3FF12] shrink-0">
                      <Plug className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-display font-bold text-[#F5F7F5]">
                        {item.name}
                      </h2>
                      <p className="text-xs text-[#9DA89F]">{item.subtitle}</p>
                    </div>
                  </div>
                  <StatusBadge label={item.status} tone={statusTone(item.status)} />
                </div>

                <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#9DA89F]">Contrato / Adapter:</span>
                    <span className="font-mono text-[#A3FF12]">{adapter.displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9DA89F]">Identificador:</span>
                    <span className="font-mono text-[#F5F7F5]">{item.identifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9DA89F]">Direção / Intervalo:</span>
                    <span className="text-[#F5F7F5]">
                      {item.syncDirection} · a cada {item.syncIntervalMinutes} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9DA89F]">Última sincronização:</span>
                    <span className="text-[#F5F7F5] tabular-nums">
                      {item.lastSyncAt ? formatDateTimeBR(item.lastSyncAt) : 'Nunca executado'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {item.enabledFeatures.map((feat) => (
                    <span
                      key={feat}
                      className="px-2 py-0.5 rounded-md bg-[#171D18] border border-[#29332C] text-[11px] text-[#9DA89F]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-[#9DA89F] leading-relaxed">
                  {item.requiresBackendNote}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#29332C]/80">
                <SecondaryButton
                  loading={testingId === item.id}
                  onClick={() => handleTest(item)}
                  className="text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Verificar conexão
                </SecondaryButton>
                <PrimaryButton onClick={() => setEditing(item)} className="text-xs">
                  <Settings className="w-3.5 h-3.5" />
                  Configurar contrato
                </PrimaryButton>
              </div>
            </section>
          );
        })}
      </div>

      {/* Sync Jobs History */}
      <SettingsCard title="Histórico de jobs de sincronização">
        <div className="space-y-2.5">
          {syncJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-semibold text-[#F5F7F5] capitalize">
                  {job.integrationId.replace('_', ' ')} · {job.recordsProcessed} registro(s)
                </div>
                <div className="text-[#9DA89F] mt-0.5">{job.note}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge
                  label={job.status}
                  tone={job.status === 'Concluído' ? 'success' : 'warning'}
                />
                <span className="text-[#9DA89F] tabular-nums">
                  {formatDateTimeBR(job.startedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Integration Config Drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#111713] border-l border-[#29332C] h-full overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-display font-bold text-[#F5F7F5]">
                  Configurar {editing.name}
                </h2>
                <p className="text-xs text-[#9DA89F] mt-0.5">{editing.platformName}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg text-[#9DA89F] hover:text-[#F5F7F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateIntegration(editing.id, editing);
                setEditing(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[#9DA89F] mb-1">Nome da integração</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                />
              </div>

              <div>
                <label className="block text-[#9DA89F] mb-1">URL de referência</label>
                <input
                  type="text"
                  value={editing.referenceUrl}
                  onChange={(e) => setEditing({ ...editing, referenceUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9DA89F] mb-1">Identificador</label>
                  <input
                    type="text"
                    value={editing.identifier}
                    onChange={(e) => setEditing({ ...editing, identifier: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] font-mono text-[#F5F7F5]"
                  />
                </div>
                <div>
                  <label className="block text-[#9DA89F] mb-1">Intervalo (minutos)</label>
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={editing.syncIntervalMinutes}
                    onChange={(e) =>
                      setEditing({ ...editing, syncIntervalMinutes: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] font-mono text-[#F5F7F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9DA89F] mb-1">Direção da sincronização</label>
                  <select
                    value={editing.syncDirection}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        syncDirection: e.target.value as IntegrationItem['syncDirection'],
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                  >
                    <option value="Entrada">Entrada</option>
                    <option value="Saída">Saída</option>
                    <option value="Bidirecional">Bidirecional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#9DA89F] mb-1">Tratamento de conflitos</label>
                  <select
                    value={editing.conflictStrategy}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        conflictStrategy: e.target.value as IntegrationItem['conflictStrategy'],
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                  >
                    <option value="Preservar origem">Preservar origem</option>
                    <option value="Priorizar CRM">Priorizar CRM</option>
                    <option value="Solicitar revisão manual">Solicitar revisão manual</option>
                  </select>
                </div>
              </div>

              {/* Field Mapping */}
              <div>
                <div className="font-semibold text-[#F5F7F5] mb-2">Mapeamento de campos</div>
                <div className="space-y-2">
                  {editing.fieldMappings.map((fm, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={fm.sourceField}
                        onChange={(e) => {
                          const next = [...editing.fieldMappings];
                          next[idx] = { ...fm, sourceField: e.target.value };
                          setEditing({ ...editing, fieldMappings: next });
                        }}
                        className="h-9 px-2.5 rounded-lg bg-[#0B0F0C] border border-[#29332C] font-mono text-[#F5F7F5]"
                      />
                      <input
                        type="text"
                        value={fm.targetField}
                        onChange={(e) => {
                          const next = [...editing.fieldMappings];
                          next[idx] = { ...fm, targetField: e.target.value };
                          setEditing({ ...editing, fieldMappings: next });
                        }}
                        className="h-9 px-2.5 rounded-lg bg-[#0B0F0C] border border-[#29332C] font-mono text-[#A3FF12]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure Credential Placeholder */}
              <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-[#F5F7F5]">
                  <KeyRound className="w-4 h-4 text-[#F2B84B]" />
                  Credenciais e Segredos (Somente Backend)
                </div>
                <p className="text-[#9DA89F] leading-relaxed">
                  API Keys, Client Secrets e tokens de webhook serão informados e criptografados exclusivamente no backend quando o serviço for conectado. Nunca salvamos credenciais reais no navegador.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <SecondaryButton onClick={() => setEditing(null)}>Cancelar</SecondaryButton>
                <PrimaryButton type="submit">
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar configuração
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
