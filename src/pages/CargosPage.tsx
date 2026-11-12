import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Layers,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { AutoRoleRule } from '@/src/types/crm';
import {
  DiscordRoleSelector,
  PageHeader,
  PrimaryButton,
  SettingsCard,
  StatusBadge,
  ToggleSwitch,
} from '@/src/components/ui/Primitives';

export function CargosPage() {
  const { roles, autoRoleRules, addAutoRoleRule, toggleAutoRoleRule, deleteAutoRoleRule } = useCRM();

  const [clientRoleId, setClientRoleId] = useState('role-client');
  const [buyerRoleId, setBuyerRoleId] = useState('role-buyer');
  const [verifiedRoleId, setVerifiedRoleId] = useState('role-verified');
  const [staffRoleId, setStaffRoleId] = useState('role-staff');

  const [newRule, setNewRule] = useState({
    name: '',
    trigger: 'Novo membro entrar',
    condition: 'Verificação concluída',
    actionRoleId: 'role-client',
    triggerType: 'verified' as AutoRoleRule['triggerType'],
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name.trim()) return;
    addAutoRoleRule({
      name: newRule.name.trim(),
      enabled: true,
      trigger: newRule.trigger,
      condition: newRule.condition,
      actionRoleId: newRule.actionRoleId,
      triggerType: newRule.triggerType,
    });
    setNewRule((s) => ({ ...s, name: '' }));
  };

  // Detect hierarchy or missing permission warnings
  const hierarchyWarnings = autoRoleRules
    .filter((r) => {
      const targetRole = roles.find((role) => role.id === r.actionRoleId);
      return !targetRole || !targetRole.assignableByBot;
    })
    .map((r) => {
      const targetRole = roles.find((role) => role.id === r.actionRoleId);
      if (!targetRole) {
        return `A regra "${r.name}" aponta para um cargo inexistente no servidor.`;
      }
      return `O cargo @${targetRole.name} na regra "${r.name}" está acima da posição do bot ou é gerenciado (conflito de hierarquia / falta de permissão MANAGE_ROLES).`;
    });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gerenciador de Cargos e Autoroles"
        subtitle="Configure atribuições automáticas, cargos por botão e diagnósticos de hierarquia"
      />

      {/* Diagnostic Warnings */}
      {hierarchyWarnings.length > 0 && (
        <div className="rounded-2xl bg-[#F2B84B]/10 border border-[#F2B84B]/35 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F2B84B]">
            <AlertTriangle className="w-4 h-4" />
            Avisos de hierarquia e permissões do Bot
          </div>
          {hierarchyWarnings.map((w, i) => (
            <p key={i} className="text-xs text-[#F5F7F5]/90">
              • {w}
            </p>
          ))}
        </div>
      )}

      {/* Default Roles Mapping */}
      <SettingsCard
        title="Cargos padrão da operação"
        description="Mapeamento visual dos cargos essenciais utilizados pela loja e pelo bot"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DiscordRoleSelector label="Cargo de Cliente" value={clientRoleId} onChange={setClientRoleId} />
          <DiscordRoleSelector label="Cargo de Comprador" value={buyerRoleId} onChange={setBuyerRoleId} />
          <DiscordRoleSelector label="Cargo de Verificação" value={verifiedRoleId} onChange={setVerifiedRoleId} />
          <DiscordRoleSelector label="Cargo da Equipe" value={staffRoleId} onChange={setStaffRoleId} />
        </div>
        <div className="mt-4 pt-3 border-t border-[#29332C]/70 flex items-center gap-2 text-xs text-[#9DA89F]">
          <ShieldAlert className="w-4 h-4 text-[#72A8FF] shrink-0" />
          <span>
            Requisito Discord: o bot precisa da permissão <code className="font-mono text-[#A3FF12]">MANAGE_ROLES</code> e estar posicionado acima dos cargos atribuídos na hierarquia do servidor.
          </span>
        </div>
      </SettingsCard>

      {/* Visual Rule Builder + Rules List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <SettingsCard
            title="Nova regra de cargo automático"
            description="Defina Quando → Condição → Ação sem código"
          >
            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Nome da regra</label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={(e) => setNewRule((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Ex: VIP após 3 compras"
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Quando (Gatilho)</label>
                <select
                  value={newRule.trigger}
                  onChange={(e) => setNewRule((s) => ({ ...s, trigger: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                >
                  <option value="Novo membro entrar">Novo membro entrar</option>
                  <option value="Pedido aprovado">Pedido aprovado</option>
                  <option value="Clique em botão no painel">Clique em botão no painel</option>
                  <option value="Verificação concluída">Verificação concluída</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Condição</label>
                <input
                  type="text"
                  value={newRule.condition}
                  onChange={(e) => setNewRule((s) => ({ ...s, condition: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                />
              </div>

              <DiscordRoleSelector
                label="Ação: Atribuir cargo"
                value={newRule.actionRoleId}
                onChange={(roleId) => setNewRule((s) => ({ ...s, actionRoleId: roleId }))}
              />

              <PrimaryButton type="submit" className="w-full">
                <Plus className="w-4 h-4" />
                Adicionar regra de autorole
              </PrimaryButton>
            </form>
          </SettingsCard>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <SettingsCard title={`Regras configuradas (${autoRoleRules.length})`}>
            <div className="space-y-3">
              {autoRoleRules.map((rule) => {
                const roleObj = roles.find((r) => r.id === rule.actionRoleId);
                return (
                  <div
                    key={rule.id}
                    className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#A3FF12]" />
                        <span className="text-sm font-semibold text-[#F5F7F5]">{rule.name}</span>
                        <StatusBadge
                          label={rule.enabled ? 'Ativa' : 'Pausada'}
                          tone={rule.enabled ? 'success' : 'neutral'}
                        />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <ToggleSwitch
                          checked={rule.enabled}
                          onChange={() => toggleAutoRoleRule(rule.id)}
                          label={`Alternar ${rule.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => deleteAutoRoleRule(rule.id)}
                          aria-label={`Excluir regra ${rule.name}`}
                          className="p-1.5 rounded-lg text-[#9DA89F] hover:text-[#F06464] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-[#171D18] border border-[#29332C] text-[#9DA89F]">
                        Quando: <strong className="text-[#F5F7F5]">{rule.trigger}</strong>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A3FF12]" />
                      <span className="px-2.5 py-1 rounded-lg bg-[#171D18] border border-[#29332C] text-[#9DA89F]">
                        Condição: <strong className="text-[#F5F7F5]">{rule.condition}</strong>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A3FF12]" />
                      <span className="px-2.5 py-1 rounded-lg bg-[#294C10]/60 border border-[#74C900]/40 text-[#A3FF12] font-medium">
                        Atribuir @{roleObj?.name || 'Cargo removido'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SettingsCard>

          <SettingsCard title="Cargos existentes no servidor (Demo)">
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <div
                  key={r.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="font-medium text-[#F5F7F5]">@{r.name}</span>
                  <span className="text-[#9DA89F] tabular-nums">({r.memberCount})</span>
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
