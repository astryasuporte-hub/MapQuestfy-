import React, { useState } from 'react';
import { Lock, Plus, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { PERMISSION_MODULES } from '@/src/data/seedData';
import { AccessProfile, PermissionAction, PermissionModuleKey } from '@/src/types/crm';
import { adminAuthorizeSchema } from '@/src/schemas/validation';
import { formatDateTimeBR } from '@/src/services/formatters';
import {
  ConfirmationDialog,
  PageHeader,
  PrimaryButton,
  SettingsCard,
  StatusBadge,
  UserAvatar,
} from '@/src/components/ui/Primitives';

const ACTION_LABELS: { key: PermissionAction; label: string }[] = [
  { key: 'view', label: 'Visualizar' },
  { key: 'create', label: 'Criar' },
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Excluir' },
  { key: 'execute', label: 'Executar' },
  { key: 'admin', label: 'Administrar' },
];

export function PermissoesPage() {
  const {
    admins,
    currentUser,
    roleMatrices,
    addAdminUser,
    updateAdminUser,
    revokeAdminUser,
    updateRoleMatrix,
    pushToast,
  } = useCRM();

  const [selectedProfile, setSelectedProfile] = useState<AccessProfile>('Administrador');
  const [formState, setFormState] = useState({
    discordId: '',
    displayName: '',
    discordHandle: '',
    profile: 'Administrador' as AccessProfile,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    adminId: string;
    name: string;
    nextProfile: AccessProfile;
  } | null>(null);

  const activeMatrix = roleMatrices.find((r) => r.profile === selectedProfile) || roleMatrices[0];

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = adminAuthorizeSchema.safeParse(formState);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Dados inválidos.');
      return;
    }
    if (admins.some((a) => a.discordId === parsed.data.discordId)) {
      setFormError('Este Discord ID já está cadastrado.');
      return;
    }
    addAdminUser({
      discordId: parsed.data.discordId,
      displayName: parsed.data.displayName,
      discordHandle: parsed.data.discordHandle.startsWith('@')
        ? parsed.data.discordHandle
        : `@${parsed.data.discordHandle}`,
      profile: parsed.data.profile,
    });
    setFormState({
      discordId: '',
      displayName: '',
      discordHandle: '',
      profile: 'Administrador',
    });
  };

  const toggleMatrixCell = (moduleKey: PermissionModuleKey, action: PermissionAction) => {
    if (selectedProfile === 'Proprietário') {
      pushToast({
        type: 'warning',
        title: 'Perfil Proprietário mantém acesso integral',
      });
      return;
    }
    const currentPerms = activeMatrix.permissions[moduleKey];
    const nextPermissions = {
      ...activeMatrix.permissions,
      [moduleKey]: {
        ...currentPerms,
        [action]: !currentPerms[action],
      },
    };
    updateRoleMatrix(selectedProfile, nextPermissions);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Permissões e Administradores"
        subtitle="Autorização por Discord ID (string até 20 dígitos) e matriz granular de acesso"
      />

      {/* Security Architecture Notice */}
      <div className="rounded-2xl bg-[#111713] border border-[#A3FF12]/30 p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#A3FF12] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-[#F5F7F5]">
            Segurança: Frontend não é fonte de verdade das permissões
          </div>
          <p className="text-[#9DA89F] leading-relaxed">
            Em produção, toda verificação RBAC e vínculo de Discord ID é validada no servidor autenticado via OAuth2. Ninguém se torna administrador apenas digitando um ID, e usuários não podem conceder ou elevar privilégios a si mesmos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Add Discord ID Form */}
        <div className="lg:col-span-4">
          <SettingsCard
            title="Cadastrar Discord ID autorizado"
            description="Armazenado rigorosamente como string (até 20 dígitos)"
          >
            <form onSubmit={handleAddAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9DA89F] mb-1">Discord ID (17 a 20 dígitos)</label>
                <input
                  type="text"
                  required
                  value={formState.discordId}
                  onChange={(e) => setFormState((s) => ({ ...s, discordId: e.target.value }))}
                  placeholder="Ex: 141234567890123456"
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] font-mono text-[#F5F7F5]"
                />
              </div>
              <div>
                <label className="block text-[#9DA89F] mb-1">Nome de exibição</label>
                <input
                  type="text"
                  required
                  value={formState.displayName}
                  onChange={(e) => setFormState((s) => ({ ...s, displayName: e.target.value }))}
                  placeholder="Ex: Lucas Operações"
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                />
              </div>
              <div>
                <label className="block text-[#9DA89F] mb-1">@ Discord</label>
                <input
                  type="text"
                  required
                  value={formState.discordHandle}
                  onChange={(e) => setFormState((s) => ({ ...s, discordHandle: e.target.value }))}
                  placeholder="@lucas.ops"
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                />
              </div>
              <div>
                <label className="block text-[#9DA89F] mb-1">Perfil de acesso</label>
                <select
                  value={formState.profile}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, profile: e.target.value as AccessProfile }))
                  }
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                >
                  {(
                    [
                      'Proprietário',
                      'Superadmin',
                      'Administrador',
                      'Moderador',
                      'Suporte',
                      'Analista',
                    ] as AccessProfile[]
                  ).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              {formError && <p className="text-[#F06464]">{formError}</p>}
              <PrimaryButton type="submit" className="w-full">
                <Plus className="w-4 h-4" />
                Autorizar Discord ID (Demo)
              </PrimaryButton>
            </form>
          </SettingsCard>
        </div>

        {/* Registered Admins Table */}
        <div className="lg:col-span-8">
          <SettingsCard title={`Operadores e Administradores (${admins.length})`}>
            <div className="space-y-3">
              {admins.map((adm) => {
                const isSelf = adm.discordId === currentUser.discordId;
                return (
                  <div
                    key={adm.id}
                    className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar src={adm.avatarUrl} name={adm.displayName} size="md" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[#F5F7F5]">
                            {adm.displayName}
                          </span>
                          <span className="text-xs text-[#9DA89F]">{adm.discordHandle}</span>
                          {isSelf && <StatusBadge label="Você" tone="accent" />}
                          <StatusBadge
                            label={adm.authLinked ? 'OAuth vinculado' : 'Aguardando 1º login'}
                            tone={adm.authLinked ? 'success' : 'warning'}
                          />
                        </div>
                        <div className="text-[11px] font-mono text-[#9DA89F] tabular-nums mt-0.5">
                          Discord ID: {adm.discordId} · Adicionado em {formatDateTimeBR(adm.addedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={adm.profile}
                        disabled={isSelf}
                        title={
                          isSelf
                            ? 'Bloqueado: você não pode alterar os próprios privilégios'
                            : 'Alterar perfil'
                        }
                        onChange={(e) =>
                          setConfirmRoleChange({
                            adminId: adm.id,
                            name: adm.displayName,
                            nextProfile: e.target.value as AccessProfile,
                          })
                        }
                        className="h-9 px-2.5 rounded-xl bg-[#111713] border border-[#29332C] text-xs text-[#F5F7F5] disabled:opacity-50"
                      >
                        {roleMatrices.map((r) => (
                          <option key={r.profile} value={r.profile}>
                            {r.profile}
                          </option>
                        ))}
                      </select>

                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => setRevokeTarget({ id: adm.id, name: adm.displayName })}
                          className="h-9 px-2.5 rounded-xl bg-[#171D18] border border-[#29332C] text-[#F06464] hover:border-[#F06464]/50 cursor-pointer"
                          title="Revogar privilégios"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SettingsCard>
        </div>
      </div>

      {/* Permission Matrix */}
      <SettingsCard
        title="Matriz visual de permissões por perfil"
        description="Selecione um perfil para visualizar e ajustar as permissões demonstrativas por módulo"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {roleMatrices.map((rm) => (
            <button
              key={rm.profile}
              type="button"
              onClick={() => setSelectedProfile(rm.profile)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                selectedProfile === rm.profile
                  ? 'bg-[#294C10] border-[#A3FF12]/60 text-[#A3FF12]'
                  : 'bg-[#0B0F0C] border-[#29332C] text-[#9DA89F] hover:text-[#F5F7F5]'
              }`}
            >
              {rm.profile}
            </button>
          ))}
        </div>

        <p className="text-xs text-[#9DA89F] mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#A3FF12]" />
          <span>{activeMatrix.description}</span>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[#29332C] text-xs font-medium text-[#9DA89F]">
                <th className="py-2.5 px-3">Módulo / Escopo</th>
                {ACTION_LABELS.map((a) => (
                  <th key={a.key} className="py-2.5 px-3 text-center">
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29332C]/70 text-xs">
              {PERMISSION_MODULES.map((mod) => {
                const perms = activeMatrix.permissions[mod.key];
                return (
                  <tr key={mod.key} className="hover:bg-[#171D18]/40">
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-[#A3FF12] text-[11px]">{mod.key}</div>
                      <div className="text-[#F5F7F5]">{mod.label}</div>
                    </td>
                    {ACTION_LABELS.map((a) => (
                      <td key={a.key} className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perms[a.key]}
                          onChange={() => toggleMatrixCell(mod.key, a.key)}
                          aria-label={`${mod.label} - ${a.label}`}
                          className="w-4 h-4 rounded accent-[#A3FF12] cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      {/* Confirmations */}
      <ConfirmationDialog
        open={Boolean(revokeTarget)}
        danger
        title="Revogar privilégios administrativos"
        description={`Tem certeza que deseja remover ${revokeTarget?.name || ''} da lista de administradores autorizados?`}
        confirmLabel="Revogar acesso"
        onCancel={() => setRevokeTarget(null)}
        onConfirm={() => {
          if (revokeTarget) revokeAdminUser(revokeTarget.id);
          setRevokeTarget(null);
        }}
      />

      <ConfirmationDialog
        open={Boolean(confirmRoleChange)}
        title="Confirmar alteração de perfil"
        description={`Alterar o perfil de acesso de ${confirmRoleChange?.name || ''} para "${confirmRoleChange?.nextProfile || ''}"? Em produção esta operação gera registro obrigatório de auditoria.`}
        confirmLabel="Confirmar alteração"
        onCancel={() => setConfirmRoleChange(null)}
        onConfirm={() => {
          if (confirmRoleChange) {
            updateAdminUser(confirmRoleChange.adminId, { profile: confirmRoleChange.nextProfile });
            pushToast({ type: 'success', title: 'Perfil atualizado (Demo)' });
          }
          setConfirmRoleChange(null);
        }}
      />
    </div>
  );
}
