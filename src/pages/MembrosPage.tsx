import React, { useMemo, useState } from 'react';
import { ShieldCheck, UserCheck, Users, X } from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { DiscordMember } from '@/src/types/crm';
import { formatDateTimeBR } from '@/src/services/formatters';
import { DataTable, DataTableColumn } from '@/src/components/ui/DataTable';
import {
  EmptyState,
  PageHeader,
  SearchInput,
  StatusBadge,
  UserAvatar,
} from '@/src/components/ui/Primitives';

export function MembrosPage() {
  const { members, roles, updateMemberRoles } = useCRM();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [editingMember, setEditingMember] = useState<DiscordMember | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const mRole = roleFilter === 'todos' || m.roleIds.includes(roleFilter);
      const mQuery =
        !q ||
        m.displayName.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        m.discordId.includes(q);
      return mRole && mQuery;
    });
  }, [members, query, roleFilter]);

  const toggleRoleOnMember = (member: DiscordMember, roleId: string) => {
    const exists = member.roleIds.includes(roleId);
    const next = exists
      ? member.roleIds.filter((id) => id !== roleId)
      : [...member.roleIds, roleId];
    updateMemberRoles(member.id, next);
    setEditingMember({ ...member, roleIds: next });
  };

  const columns: DataTableColumn<DiscordMember>[] = [
    {
      key: 'member',
      header: 'Membro',
      sortable: true,
      sortValue: (m) => m.displayName,
      render: (m) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={m.avatarUrl} name={m.displayName} size="sm" />
          <div>
            <div className="font-medium text-[#F5F7F5]">{m.displayName}</div>
            <div className="text-xs text-[#9DA89F]">@{m.username}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'discordId',
      header: 'Discord ID',
      render: (m) => (
        <span className="font-mono text-xs text-[#9DA89F] tabular-nums">{m.discordId}</span>
      ),
    },
    {
      key: 'roles',
      header: 'Cargos',
      render: (m) => (
        <div className="flex flex-wrap gap-1">
          {m.roleIds.map((rid) => {
            const role = roles.find((r) => r.id === rid);
            if (!role) return null;
            return (
              <span
                key={rid}
                className="px-2 py-0.5 rounded-md bg-[#171D18] border border-[#29332C] text-[11px] text-[#F5F7F5]"
                style={{ borderColor: `${role.color}55` }}
              >
                {role.name}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: 'verified',
      header: 'Verificação',
      render: (m) => (
        <StatusBadge
          label={m.verified ? 'Verificado' : 'Pendente'}
          tone={m.verified ? 'success' : 'warning'}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => (
        <StatusBadge
          label={m.status}
          tone={m.status === 'ativo' ? 'success' : m.status === 'silenciado' ? 'warning' : 'error'}
        />
      ),
    },
    {
      key: 'joined',
      header: 'Entrada',
      render: (m) => (
        <span className="text-xs text-[#9DA89F] tabular-nums">
          {formatDateTimeBR(m.joinedAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Membros do Servidor"
        subtitle="Visualização de identidades Discord, verificação e cargos atribuídos (Modo demonstração)"
      />

      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nome, @username ou Discord ID..."
          className="w-full sm:w-80"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
        >
          <option value="todos">Todos os cargos</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              @{r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 sm:p-5">
        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={(m) => setEditingMember(m)}
          emptyFallback={
            <EmptyState
              icon={<Users className="w-5 h-5" />}
              title="Nenhum membro encontrado"
              description="Ajuste a busca ou filtro de cargos."
            />
          }
          renderMobileCard={(m) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserAvatar src={m.avatarUrl} name={m.displayName} size="sm" />
                  <div>
                    <div className="text-sm font-semibold text-[#F5F7F5]">{m.displayName}</div>
                    <div className="text-[11px] font-mono text-[#9DA89F]">{m.discordId}</div>
                  </div>
                </div>
                <StatusBadge
                  label={m.verified ? 'Verificado' : 'Pendente'}
                  tone={m.verified ? 'success' : 'warning'}
                />
              </div>
            </div>
          )}
        />
      </div>

      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#111713] border border-[#29332C] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={editingMember.avatarUrl}
                  name={editingMember.displayName}
                  size="md"
                />
                <div>
                  <h3 className="text-base font-display font-bold text-[#F5F7F5]">
                    {editingMember.displayName}
                  </h3>
                  <div className="text-xs font-mono text-[#9DA89F]">{editingMember.discordId}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-[#9DA89F] hover:text-[#F5F7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-[#9DA89F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#A3FF12]" />
                Gerenciar cargos no modo demonstração
              </div>
              <div className="grid grid-cols-2 gap-2">
                {roles
                  .filter((r) => r.assignableByBot)
                  .map((r) => {
                    const active = editingMember.roleIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRoleOnMember(editingMember, r.id)}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium text-left transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#294C10]/60 border-[#A3FF12]/50 text-[#F5F7F5]'
                            : 'bg-[#0B0F0C] border-[#29332C] text-[#9DA89F]'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5 inline mr-1.5" />
                        {r.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
