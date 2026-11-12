import React, { useState } from 'react';
import { Eye, Sliders, Terminal, X } from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { BotCommand } from '@/src/types/crm';
import {
  BackendHonestNotice,
  PageHeader,
  SearchInput,
  StatusBadge,
  ToggleSwitch,
} from '@/src/components/ui/Primitives';

export function ComandosPage() {
  const { commands, roles, channels, updateCommand, pushToast } = useCRM();
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('todas');
  const [previewCmd, setPreviewCmd] = useState<BotCommand | null>(null);
  const [editingCmd, setEditingCmd] = useState<BotCommand | null>(null);

  const filtered = commands.filter((c) => {
    const mCat = catFilter === 'todas' || c.category === catFilter;
    const mQuery =
      !query.trim() ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase());
    return mCat && mQuery;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gerenciador de Comandos Slash"
        subtitle="Controle de visibilidade, cargos autorizados, canais e prévia de resposta"
      />

      <BackendHonestNotice message="A execução real de comandos Slash ocorre exclusivamente no serviço do bot Discord conectado ao gateway." />

      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar comando (ex: /ticket, /ban)..."
          className="w-full sm:w-72"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
        >
          <option value="todas">Todas as categorias</option>
          <option value="Geral">Geral</option>
          <option value="Tickets">Tickets</option>
          <option value="Loja">Loja</option>
          <option value="Moderação">Moderação</option>
          <option value="Cargos">Cargos</option>
        </select>
      </div>

      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 sm:p-5 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[780px]">
          <thead>
            <tr className="border-b border-[#29332C] text-xs font-medium text-[#9DA89F]">
              <th className="py-3 px-3">Comando</th>
              <th className="py-3 px-3">Descrição</th>
              <th className="py-3 px-3">Categoria</th>
              <th className="py-3 px-3">Cargos autorizados</th>
              <th className="py-3 px-3">Canais permitidos</th>
              <th className="py-3 px-3">Estado</th>
              <th className="py-3 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#29332C]/70 text-xs">
            {filtered.map((cmd) => (
              <tr key={cmd.id} className="hover:bg-[#171D18]/50">
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#A3FF12]">
                    <Terminal className="w-3.5 h-3.5" />
                    {cmd.name}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-[#F5F7F5] max-w-xs">{cmd.description}</td>
                <td className="py-3.5 px-3">
                  <StatusBadge label={cmd.category} tone="neutral" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex flex-wrap gap-1">
                    {cmd.authorizedRoleIds.map((rid) => {
                      const r = roles.find((item) => item.id === rid);
                      return (
                        <span
                          key={rid}
                          className="px-2 py-0.5 rounded bg-[#0B0F0C] border border-[#29332C] text-[11px] text-[#F5F7F5]"
                        >
                          @{r?.name || rid}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="py-3.5 px-3 font-mono text-[11px] text-[#9DA89F]">
                  {cmd.allowedChannelIds
                    .map((cid) => `#${channels.find((c) => c.id === cid)?.name || cid}`)
                    .join(', ')}
                </td>
                <td className="py-3.5 px-3">
                  <ToggleSwitch
                    checked={cmd.enabled}
                    onChange={() => {
                      updateCommand(cmd.id, { enabled: !cmd.enabled });
                      pushToast({
                        type: 'info',
                        title: `Comando ${cmd.name} ${!cmd.enabled ? 'ativado' : 'desativado'}`,
                      });
                    }}
                    label={`Alternar ${cmd.name}`}
                  />
                </td>
                <td className="py-3.5 px-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewCmd(cmd)}
                      title="Visualizar prévia"
                      className="p-1.5 rounded-lg bg-[#171D18] border border-[#29332C] text-[#9DA89F] hover:text-[#A3FF12] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCmd(cmd)}
                      title="Configurar opções"
                      className="p-1.5 rounded-lg bg-[#171D18] border border-[#29332C] text-[#9DA89F] hover:text-[#F5F7F5] cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {previewCmd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#111713] border border-[#29332C] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-[#A3FF12]">{previewCmd.name}</span>
              <button
                type="button"
                onClick={() => setPreviewCmd(null)}
                className="text-[#9DA89F] hover:text-[#F5F7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl bg-[#313338] p-4 text-xs text-[#DBDEE1] space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">MapQuestfy Guard</span>
                <span className="px-1.5 py-0.5 rounded bg-[#5865F2] text-[10px] text-white font-semibold">
                  APP
                </span>
                {previewCmd.ephemeral && (
                  <span className="text-[11px] text-[#949BA4]">· Visível apenas para você</span>
                )}
              </div>
              <p className="leading-relaxed">{previewCmd.previewResponse}</p>
            </div>
            <div className="text-xs text-[#9DA89F]">
              Permissões necessárias: <span className="font-mono text-[#F5F7F5]">{previewCmd.requiredPermissions.join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Options Modal */}
      {editingCmd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#111713] border border-[#29332C] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#F5F7F5]">
                Configurar <span className="font-mono text-[#A3FF12]">{editingCmd.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingCmd(null)}
                className="text-[#9DA89F] hover:text-[#F5F7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9DA89F] mb-1">Cooldown (segundos)</label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={editingCmd.cooldownSeconds}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updateCommand(editingCmd.id, { cooldownSeconds: val });
                    setEditingCmd({ ...editingCmd, cooldownSeconds: val });
                  }}
                  className="w-full h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] font-mono text-[#F5F7F5]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#F5F7F5]">Resposta efêmera (privada)</span>
                <ToggleSwitch
                  checked={editingCmd.ephemeral}
                  onChange={() => {
                    const next = !editingCmd.ephemeral;
                    updateCommand(editingCmd.id, { ephemeral: next });
                    setEditingCmd({ ...editingCmd, ephemeral: next });
                  }}
                  label="Resposta efêmera"
                />
              </div>

              <div>
                <label className="block text-[#9DA89F] mb-1">Prévia da resposta</label>
                <textarea
                  rows={3}
                  value={editingCmd.previewResponse}
                  onChange={(e) => {
                    updateCommand(editingCmd.id, { previewResponse: e.target.value });
                    setEditingCmd({ ...editingCmd, previewResponse: e.target.value });
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
