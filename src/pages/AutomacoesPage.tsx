import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Play,
  Plus,
  Save,
  Trash2,
  Zap,
} from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import {
  Automation,
  AutomationAction,
  AutomationCondition,
  AutomationTrigger,
} from '@/src/types/crm';
import { formatDateTimeBR } from '@/src/services/formatters';
import {
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SettingsCard,
  StatusBadge,
  ToggleSwitch,
} from '@/src/components/ui/Primitives';

const TRIGGERS: { type: AutomationTrigger['type']; label: string }[] = [
  { type: 'discord_member_join', label: 'Novo membro no Discord' },
  { type: 'member_verified', label: 'Membro verificado' },
  { type: 'ticket_opened', label: 'Ticket aberto' },
  { type: 'ticket_closed', label: 'Ticket encerrado' },
  { type: 'order_approved', label: 'Pedido aprovado' },
  { type: 'order_canceled', label: 'Pedido cancelado' },
  { type: 'customer_created', label: 'Cliente cadastrado' },
  { type: 'integration_event', label: 'Evento de integração recebido' },
  { type: 'scheduled_event', label: 'Evento agendado' },
];

const CONDITION_FIELDS: { field: AutomationCondition['field']; label: string }[] = [
  { field: 'role', label: 'Cargo' },
  { field: 'channel', label: 'Canal' },
  { field: 'order_value', label: 'Valor do pedido' },
  { field: 'product', label: 'Produto' },
  { field: 'source', label: 'Origem' },
  { field: 'status', label: 'Status' },
  { field: 'tag', label: 'Etiqueta' },
  { field: 'discord_linked', label: 'Conta Discord vinculada' },
];

const ACTION_TYPES: { type: AutomationAction['type']; label: string }[] = [
  { type: 'send_message', label: 'Enviar mensagem' },
  { type: 'create_ticket', label: 'Criar ticket' },
  { type: 'add_role', label: 'Adicionar cargo' },
  { type: 'remove_role', label: 'Remover cargo' },
  { type: 'send_warning', label: 'Enviar aviso' },
  { type: 'add_tag', label: 'Adicionar etiqueta' },
  { type: 'create_activity', label: 'Criar atividade' },
  { type: 'notify_team', label: 'Notificar equipe' },
];

export function AutomacoesPage() {
  const {
    automations,
    automationExecutions,
    saveAutomation,
    toggleAutomation,
    runAutomationTest,
    deleteAutomation,
  } = useCRM();

  const [selectedId, setSelectedId] = useState<string>(automations[0]?.id || '');
  const activeAuto =
    automations.find((a) => a.id === selectedId) || automations[0] || null;

  const [draft, setDraft] = useState<Automation | null>(activeAuto);

  const selectFlow = (a: Automation) => {
    setSelectedId(a.id);
    setDraft(a);
  };

  const handleCreateNew = () => {
    const fresh: Automation = {
      id: `aut-${Date.now()}`,
      name: 'Nova Automação MapQuestfy',
      description: 'Descreva o objetivo deste fluxo automático.',
      enabled: true,
      trigger: { type: 'order_approved', label: 'Pedido aprovado' },
      conditions: [{ field: 'source', operator: 'igual', value: 'Sharpify' }],
      actions: [{ type: 'add_role', target: '@Cliente' }],
      runCount: 0,
    };
    saveAutomation(fresh);
    setSelectedId(fresh.id);
    setDraft(fresh);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Automações Visuais"
        subtitle="Construtor de fluxos Gatilho → Condição → Ação sem escrever código"
        actions={
          <PrimaryButton onClick={handleCreateNew}>
            <Plus className="w-4 h-4" />
            Novo fluxo
          </PrimaryButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Flow List */}
        <div className="lg:col-span-4 space-y-3">
          <SettingsCard title={`Fluxos configurados (${automations.length})`}>
            <div className="space-y-2.5">
              {automations.map((a) => (
                <div
                  key={a.id}
                  onClick={() => selectFlow(a)}
                  className={`rounded-xl p-3.5 border transition-colors cursor-pointer space-y-2 ${
                    draft?.id === a.id
                      ? 'bg-[#294C10]/35 border-[#74C900]/50'
                      : 'bg-[#0B0F0C] border-[#29332C] hover:border-[#3E4C42]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#F5F7F5] truncate">{a.name}</div>
                      <div className="text-[11px] text-[#9DA89F] mt-0.5">{a.trigger.label}</div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <ToggleSwitch
                        checked={a.enabled}
                        onChange={() => toggleAutomation(a.id)}
                        label={`Alternar ${a.name}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#9DA89F] tabular-nums">{a.runCount} execuções</span>
                    {a.lastError ? (
                      <StatusBadge label="Com alerta" tone="error" />
                    ) : (
                      <StatusBadge
                        label={a.enabled ? 'Ativo' : 'Pausado'}
                        tone={a.enabled ? 'success' : 'neutral'}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>

        {/* Visual Flow Editor */}
        <div className="lg:col-span-8 space-y-5">
          {draft && (
            <SettingsCard
              title="Editor Visual do Fluxo"
              actions={
                <div className="flex items-center gap-2">
                  <SecondaryButton
                    onClick={() => runAutomationTest(draft.id)}
                    className="h-8 px-3 text-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-[#A3FF12]" />
                    Teste demonstrativo
                  </SecondaryButton>
                  {automations.length > 1 && (
                    <SecondaryButton
                      onClick={() => {
                        deleteAutomation(draft.id);
                        const next = automations.find((x) => x.id !== draft.id) || null;
                        setDraft(next);
                        if (next) setSelectedId(next.id);
                      }}
                      className="h-8 px-2.5 text-xs text-[#F06464]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </SecondaryButton>
                  )}
                </div>
              }
            >
              {draft.lastError && (
                <div className="mb-4 rounded-xl bg-[#F06464]/10 border border-[#F06464]/35 p-3 flex items-start gap-2.5 text-xs text-[#F5F7F5]">
                  <AlertCircle className="w-4 h-4 text-[#F06464] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Tratamento de falha:</span> {draft.lastError}
                  </div>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#9DA89F] mb-1">Nome do fluxo</label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#9DA89F] mb-1">Descrição</label>
                    <input
                      type="text"
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                    />
                  </div>
                </div>

                {/* Visual 3-Stage Pipeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                  {/* Stage 1: Trigger */}
                  <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-[#A3FF12]">
                      <Zap className="w-3.5 h-3.5" />
                      1. Gatilho
                    </div>
                    <select
                      value={draft.trigger.type}
                      onChange={(e) => {
                        const found = TRIGGERS.find((t) => t.type === e.target.value);
                        if (found) setDraft({ ...draft, trigger: found });
                      }}
                      className="w-full h-9 px-2.5 rounded-lg bg-[#111713] border border-[#29332C] text-[#F5F7F5]"
                    >
                      {TRIGGERS.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stage 2: Conditions */}
                  <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 space-y-2">
                    <div className="flex items-center justify-between font-semibold text-[#72A8FF]">
                      <span>2. Condições</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            conditions: [
                              ...draft.conditions,
                              { field: 'source', operator: 'igual', value: 'Sharpify' },
                            ],
                          })
                        }
                        className="text-[11px] text-[#A3FF12] hover:underline cursor-pointer"
                      >
                        + Condição
                      </button>
                    </div>
                    <div className="space-y-2">
                      {draft.conditions.map((c, idx) => (
                        <div key={idx} className="space-y-1 p-2 rounded-lg bg-[#111713] border border-[#29332C]">
                          <select
                            value={c.field}
                            onChange={(e) => {
                              const next = [...draft.conditions];
                              next[idx] = {
                                ...c,
                                field: e.target.value as AutomationCondition['field'],
                              };
                              setDraft({ ...draft, conditions: next });
                            }}
                            className="w-full h-7 px-2 rounded bg-[#0B0F0C] text-[11px] text-[#F5F7F5]"
                          >
                            {CONDITION_FIELDS.map((cf) => (
                              <option key={cf.field} value={cf.field}>
                                {cf.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={c.value}
                              onChange={(e) => {
                                const next = [...draft.conditions];
                                next[idx] = { ...c, value: e.target.value };
                                setDraft({ ...draft, conditions: next });
                              }}
                              className="flex-1 h-7 px-2 rounded bg-[#0B0F0C] border border-[#29332C] text-[11px] text-[#F5F7F5]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  conditions: draft.conditions.filter((_, i) => i !== idx),
                                })
                              }
                              className="px-1.5 text-[#F06464] cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage 3: Actions */}
                  <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 space-y-2">
                    <div className="flex items-center justify-between font-semibold text-[#36D475]">
                      <span>3. Ações</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            actions: [
                              ...draft.actions,
                              { type: 'notify_team', target: '#logs-tickets' },
                            ],
                          })
                        }
                        className="text-[11px] text-[#A3FF12] hover:underline cursor-pointer"
                      >
                        + Ação
                      </button>
                    </div>
                    <div className="space-y-2">
                      {draft.actions.map((act, idx) => (
                        <div key={idx} className="space-y-1 p-2 rounded-lg bg-[#111713] border border-[#29332C]">
                          <select
                            value={act.type}
                            onChange={(e) => {
                              const next = [...draft.actions];
                              next[idx] = {
                                ...act,
                                type: e.target.value as AutomationAction['type'],
                              };
                              setDraft({ ...draft, actions: next });
                            }}
                            className="w-full h-7 px-2 rounded bg-[#0B0F0C] text-[11px] text-[#F5F7F5]"
                          >
                            {ACTION_TYPES.map((at) => (
                              <option key={at.type} value={at.type}>
                                {at.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={act.target}
                              onChange={(e) => {
                                const next = [...draft.actions];
                                next[idx] = { ...act, target: e.target.value };
                                setDraft({ ...draft, actions: next });
                              }}
                              className="flex-1 h-7 px-2 rounded bg-[#0B0F0C] border border-[#29332C] text-[11px] text-[#F5F7F5]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  actions: draft.actions.filter((_, i) => i !== idx),
                                })
                              }
                              className="px-1.5 text-[#F06464] cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Flow Preview Strip */}
                <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3 flex flex-wrap items-center gap-2">
                  <span className="text-[#9DA89F]">Resumo:</span>
                  <span className="px-2 py-0.5 rounded bg-[#171D18] text-[#A3FF12] font-medium">
                    {draft.trigger.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9DA89F]" />
                  <span className="text-[#F5F7F5]">
                    {draft.conditions.length} condição(ões)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9DA89F]" />
                  <span className="text-[#36D475]">
                    {draft.actions.map((a) => a.target).join(' + ')}
                  </span>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton onClick={() => saveAutomation(draft)}>
                    <Save className="w-4 h-4" />
                    Salvar fluxo de automação
                  </PrimaryButton>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* Execution History */}
          <SettingsCard title="Histórico de execuções (Simulação local)">
            <div className="space-y-2">
              {automationExecutions.map((ex) => (
                <div
                  key={ex.id}
                  className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-semibold text-[#F5F7F5]">{ex.automationName}</div>
                    <div className="text-[#9DA89F] mt-0.5">{ex.summary}</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <StatusBadge
                      label={ex.status}
                      tone={ex.status === 'Falha' ? 'error' : 'info'}
                    />
                    <span className="text-[11px] text-[#9DA89F] tabular-nums">
                      {formatDateTimeBR(ex.executedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
