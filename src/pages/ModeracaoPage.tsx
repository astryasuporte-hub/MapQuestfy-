import React, { useState } from 'react';
import { AlertTriangle, Plus, Shield, ShieldAlert } from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { ModerationCase } from '@/src/types/crm';
import { discordIdSchema } from '@/src/schemas/validation';
import { formatDateTimeBR } from '@/src/services/formatters';
import {
  ConfirmationDialog,
  DiscordChannelSelector,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SettingsCard,
  StatusBadge,
  ToggleSwitch,
} from '@/src/components/ui/Primitives';

export function ModeracaoPage() {
  const {
    moderationCases,
    moderationSettings,
    roles,
    addModerationCase,
    updateModerationSettings,
  } = useCRM();

  const [typeFilter, setTypeFilter] = useState('todos');
  const [actionForm, setActionForm] = useState({
    type: 'Advertência' as ModerationCase['type'],
    targetDiscordId: '',
    targetHandle: '',
    reason: '',
    duration: '30 min',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  const filteredCases = moderationCases.filter(
    (c) => typeFilter === 'todos' || c.type === typeFilter
  );

  const submitModeration = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const idCheck = discordIdSchema.safeParse(actionForm.targetDiscordId);
    if (!idCheck.success) {
      setFormError(idCheck.error.issues[0]?.message || 'Discord ID inválido.');
      return;
    }
    if (!actionForm.reason.trim()) {
      setFormError('Informe o motivo da ação de moderação.');
      return;
    }

    if (actionForm.type === 'Expulsão' || actionForm.type === 'Banimento') {
      setPendingConfirm(true);
      return;
    }
    executeAddCase();
  };

  const executeAddCase = () => {
    addModerationCase({
      type: actionForm.type,
      targetDiscordId: actionForm.targetDiscordId.trim(),
      targetHandle: actionForm.targetHandle.trim() || `@user_${actionForm.targetDiscordId.slice(-4)}`,
      reason: actionForm.reason.trim(),
      duration: actionForm.type === 'Timeout' ? actionForm.duration : undefined,
      active: true,
    });
    setActionForm({
      type: 'Advertência',
      targetDiscordId: '',
      targetHandle: '',
      reason: '',
      duration: '30 min',
    });
    setPendingConfirm(false);
  };

  const caseTone = (t: ModerationCase['type']) => {
    if (t === 'Banimento' || t === 'Expulsão') return 'error';
    if (t === 'Timeout') return 'warning';
    return 'info';
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Moderação e Segurança"
        subtitle="Ocorrências, proteção automática antispam/antiraid e requisitos de permissões Discord"
      />

      {/* Required Discord Permissions Notice */}
      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-[#9DA89F]">
          <ShieldAlert className="w-4 h-4 text-[#A3FF12] shrink-0" />
          <span>
            Permissões necessárias no bot Discord para executar moderação real:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['MANAGE_MESSAGES', 'MODERATE_MEMBERS', 'KICK_MEMBERS', 'BAN_MEMBERS', 'VIEW_AUDIT_LOG'].map(
            (perm) => (
              <span
                key={perm}
                className="px-2 py-0.5 rounded-md bg-[#0B0F0C] border border-[#29332C] font-mono text-[11px] text-[#A3FF12]"
              >
                {perm}
              </span>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Automatic Rules + Apply Action */}
        <div className="lg:col-span-5 space-y-5">
          <SettingsCard title="Regras automáticas de proteção">
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-[#F5F7F5]">Bloqueio de links suspeitos</div>
                  <div className="text-[#9DA89F]">Remove convites e domínios de phishing</div>
                </div>
                <ToggleSwitch
                  checked={moderationSettings.blockSuspiciousLinks}
                  onChange={() =>
                    updateModerationSettings({
                      blockSuspiciousLinks: !moderationSettings.blockSuspiciousLinks,
                    })
                  }
                  label="Links suspeitos"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-[#F5F7F5]">Proteção anti-flood</div>
                  <div className="text-[#9DA89F]">Limita mensagens repetidas em sequência</div>
                </div>
                <ToggleSwitch
                  checked={moderationSettings.antiFloodEnabled}
                  onChange={() =>
                    updateModerationSettings({
                      antiFloodEnabled: !moderationSettings.antiFloodEnabled,
                    })
                  }
                  label="Anti-flood"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-[#F5F7F5]">Proteção anti-raid</div>
                  <div className="text-[#9DA89F]">Alerta entrada em massa no servidor</div>
                </div>
                <ToggleSwitch
                  checked={moderationSettings.antiRaidEnabled}
                  onChange={() =>
                    updateModerationSettings({
                      antiRaidEnabled: !moderationSettings.antiRaidEnabled,
                    })
                  }
                  label="Anti-raid"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[#9DA89F] mb-1">Limite spam (msgs / 10s)</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={moderationSettings.spamLimitPer10s}
                    onChange={(e) =>
                      updateModerationSettings({ spamLimitPer10s: Number(e.target.value) })
                    }
                    className="w-full h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] font-mono text-[#F5F7F5]"
                  />
                </div>
                <div>
                  <label className="block text-[#9DA89F] mb-1">Máx. menções por msg</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={moderationSettings.maxMentionsPerMessage}
                    onChange={(e) =>
                      updateModerationSettings({
                        maxMentionsPerMessage: Number(e.target.value),
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] font-mono text-[#F5F7F5]"
                  />
                </div>
              </div>

              <DiscordChannelSelector
                label="Canal de logs de moderação"
                value={moderationSettings.logsChannelId}
                onChange={(ch) => updateModerationSettings({ logsChannelId: ch })}
              />

              <div>
                <div className="text-[#9DA89F] mb-1.5">Cargos isentos dos filtros</div>
                <div className="flex flex-wrap gap-1.5">
                  {roles
                    .filter((r) => moderationSettings.exemptRoleIds.includes(r.id))
                    .map((r) => (
                      <StatusBadge key={r.id} label={`@${r.name}`} tone="accent" />
                    ))}
                </div>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Registrar ocorrência (Demo)"
            description="Ações graves como Expulsão e Banimento exigem confirmação explícita"
          >
            <form onSubmit={submitModeration} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Tipo</label>
                  <select
                    value={actionForm.type}
                    onChange={(e) =>
                      setActionForm((s) => ({
                        ...s,
                        type: e.target.value as ModerationCase['type'],
                      }))
                    }
                    className="w-full h-10 px-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                  >
                    <option value="Advertência">Advertência</option>
                    <option value="Timeout">Timeout</option>
                    <option value="Expulsão">Expulsão</option>
                    <option value="Banimento">Banimento</option>
                  </select>
                </div>
                {actionForm.type === 'Timeout' ? (
                  <div>
                    <label className="block text-xs text-[#9DA89F] mb-1">Duração</label>
                    <select
                      value={actionForm.duration}
                      onChange={(e) => setActionForm((s) => ({ ...s, duration: e.target.value }))}
                      className="w-full h-10 px-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                    >
                      <option value="10 min">10 minutos</option>
                      <option value="30 min">30 minutos</option>
                      <option value="1 hora">1 hora</option>
                      <option value="24 horas">24 horas</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-[#9DA89F] mb-1">@ Usuário</label>
                    <input
                      type="text"
                      value={actionForm.targetHandle}
                      onChange={(e) =>
                        setActionForm((s) => ({ ...s, targetHandle: e.target.value }))
                      }
                      placeholder="@usuario"
                      className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Discord ID do alvo</label>
                <input
                  type="text"
                  required
                  value={actionForm.targetDiscordId}
                  onChange={(e) =>
                    setActionForm((s) => ({ ...s, targetDiscordId: e.target.value }))
                  }
                  placeholder="17 a 20 dígitos numéricos"
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs font-mono text-[#F5F7F5]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Motivo</label>
                <textarea
                  rows={2}
                  required
                  value={actionForm.reason}
                  onChange={(e) => setActionForm((s) => ({ ...s, reason: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                />
              </div>

              {formError && <p className="text-xs text-[#F06464]">{formError}</p>}

              <PrimaryButton type="submit" className="w-full text-xs">
                <Plus className="w-4 h-4" />
                Registrar {actionForm.type.toLowerCase()}
              </PrimaryButton>
            </form>
          </SettingsCard>
        </div>

        {/* Right: Cases & Logs */}
        <div className="lg:col-span-7">
          <SettingsCard
            title="Painel de ocorrências e histórico"
            actions={
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
              >
                <option value="todos">Todas as ações</option>
                <option value="Advertência">Advertências</option>
                <option value="Timeout">Timeouts</option>
                <option value="Expulsão">Expulsões</option>
                <option value="Banimento">Banimentos</option>
              </select>
            }
          >
            <div className="space-y-3">
              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#A3FF12]" />
                      <StatusBadge label={c.type} tone={caseTone(c.type)} />
                      {c.duration && (
                        <span className="text-xs font-mono text-[#9DA89F]">({c.duration})</span>
                      )}
                      <span className="text-sm font-semibold text-[#F5F7F5]">{c.targetHandle}</span>
                    </div>
                    <span className="text-xs text-[#9DA89F] tabular-nums">
                      {formatDateTimeBR(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-[#F5F7F5]/90">{c.reason}</p>
                  <div className="flex items-center justify-between text-[11px] text-[#9DA89F] pt-1 border-t border-[#29332C]/60">
                    <span className="font-mono">ID: {c.targetDiscordId}</span>
                    <span>Aplicado por: {c.moderatorName}</span>
                  </div>
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>
      </div>

      <ConfirmationDialog
        open={pendingConfirm}
        danger
        title={`Confirmar ${actionForm.type}`}
        description={`Você está registrando uma ação grave (${actionForm.type}) para o Discord ID ${actionForm.targetDiscordId}. Deseja confirmar no modo demonstração?`}
        confirmLabel={`Confirmar ${actionForm.type}`}
        onCancel={() => setPendingConfirm(false)}
        onConfirm={executeAddCase}
      />
    </div>
  );
}
