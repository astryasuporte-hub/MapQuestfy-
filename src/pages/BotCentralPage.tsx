import React, { useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  Cpu,
  Server,
  ShieldAlert,
  Sliders,
  Terminal,
} from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { formatDateTimeBR, formatRelativeTimeBR } from '@/src/services/formatters';
import {
  BackendHonestNotice,
  BrandMascot,
  DiscordChannelSelector,
  PageHeader,
  SecondaryButton,
  SettingsCard,
  StatusBadge,
  ToggleSwitch,
} from '@/src/components/ui/Primitives';

export function BotCentralPage() {
  const {
    botConfig,
    guilds,
    channels,
    commands,
    activities,
    toggleBotFeature,
    updateBotFeature,
    pushToast,
  } = useCRM();

  const [tab, setTab] = useState<'visao' | 'funcionalidades' | 'configuracao' | 'eventos' | 'diagnostico'>('visao');
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);

  const enabledFeaturesCount = botConfig.features.filter((f) => f.enabled).length;
  const activeCommandsCount = commands.filter((c) => c.enabled).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Central do Bot Discord"
        subtitle="Administração do processo permanente do bot, módulos e permissões"
        actions={
          <SecondaryButton
            onClick={() =>
              pushToast({
                type: 'info',
                title: 'Ping bloqueado no modo demonstração',
                description:
                  'Esta ação estará disponível após conectar o serviço permanente do bot Discord.',
              })
            }
          >
            <Activity className="w-4 h-4 text-[#A3FF12]" />
            Testar conexão do serviço
          </SecondaryButton>
        }
      />

      <BackendHonestNotice message="O processo permanente do bot Discord opera como serviço separado do frontend. No modo demonstração, todas as alterações são salvas localmente e não afirmamos conexão em produção com a API do Discord." />

      {/* Bot Header Summary */}
      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <BrandMascot size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-display font-bold text-[#F5F7F5]">{botConfig.botName}</h2>
              <StatusBadge label="Simulado (Sem backend)" tone="warning" showIcon />
            </div>
            <div className="text-xs text-[#9DA89F] mt-1">
              <span className="font-mono text-[#F5F7F5]">{botConfig.botHandle}</span> · Versão alvo{' '}
              <span className="font-mono">{botConfig.version}</span> · Última atividade demo{' '}
              {formatRelativeTimeBR(botConfig.lastHeartbeatAt)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#29332C]">
          <div>
            <div className="text-xs text-[#9DA89F]">Servidores demo</div>
            <div className="text-xl font-display font-bold text-[#F5F7F5] tabular-nums mt-0.5">
              {guilds.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#9DA89F]">Recursos ativos</div>
            <div className="text-xl font-display font-bold text-[#A3FF12] tabular-nums mt-0.5">
              {enabledFeaturesCount}/{botConfig.features.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#9DA89F]">Comandos slash</div>
            <div className="text-xl font-display font-bold text-[#F5F7F5] tabular-nums mt-0.5">
              {activeCommandsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#29332C] pb-1">
        {(
          [
            { id: 'visao', label: 'Visão geral' },
            { id: 'funcionalidades', label: `Funcionalidades (${botConfig.features.length})` },
            { id: 'configuracao', label: 'Configuração' },
            { id: 'eventos', label: 'Eventos recentes' },
            { id: 'diagnostico', label: 'Diagnóstico' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-medium border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
              tab === t.id
                ? 'border-[#A3FF12] text-[#A3FF12] bg-[#111713]'
                : 'border-transparent text-[#9DA89F] hover:text-[#F5F7F5]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'visao' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SettingsCard title="Servidores vinculados (Modo Demonstração)">
            <div className="space-y-3">
              {guilds.map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#5865F2]/20 text-[#72A8FF] flex items-center justify-center font-display font-bold text-xs">
                      {g.iconInitials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#F5F7F5]">{g.name}</div>
                      <div className="text-xs text-[#9DA89F] tabular-nums">
                        {g.memberCount.toLocaleString('pt-BR')} membros · Nível Boost {g.boostLevel}
                      </div>
                    </div>
                  </div>
                  <StatusBadge label="Demo" tone="neutral" />
                </div>
              ))}
            </div>
          </SettingsCard>

          <SettingsCard title="Resumo de módulos habilitados">
            <div className="grid grid-cols-2 gap-2.5">
              {botConfig.features.slice(0, 8).map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3 flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-medium text-[#F5F7F5] truncate">{f.name}</span>
                  <StatusBadge
                    label={f.enabled ? 'Ativo' : 'Off'}
                    tone={f.enabled ? 'success' : 'neutral'}
                  />
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>
      )}

      {tab === 'funcionalidades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {botConfig.features.map((feat) => {
            const linkedChannel = channels.find((c) => c.id === feat.channelId);
            const isEditing = editingFeatureId === feat.id;
            return (
              <div
                key={feat.id}
                className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-display font-semibold text-[#F5F7F5]">
                        {feat.name}
                      </h3>
                      <StatusBadge
                        label={feat.enabled ? 'Ativado' : 'Desativado'}
                        tone={feat.enabled ? 'success' : 'neutral'}
                      />
                    </div>
                    <p className="text-xs text-[#9DA89F] mt-1">{feat.description}</p>
                  </div>
                  <ToggleSwitch
                    checked={feat.enabled}
                    onChange={() => {
                      toggleBotFeature(feat.id);
                      pushToast({
                        type: 'info',
                        title: `${feat.name} ${!feat.enabled ? 'ativado' : 'desativado'}`,
                      });
                    }}
                    label={`Alternar ${feat.name}`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#29332C]/60 text-[11px] text-[#9DA89F]">
                  <div>
                    Canal: <span className="font-mono text-[#F5F7F5]">#{linkedChannel?.name || 'não definido'}</span>
                  </div>
                  <div>
                    Permissões:{' '}
                    <span className="font-mono text-[#A3FF12]">
                      {feat.requiredPermissions.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#9DA89F]">
                  <span>Alterado em {formatDateTimeBR(feat.updatedAt)}</span>
                  <button
                    type="button"
                    onClick={() => setEditingFeatureId(isEditing ? null : feat.id)}
                    className="inline-flex items-center gap-1 text-[#A3FF12] hover:underline cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                    {isEditing ? 'Fechar' : 'Configurar'}
                  </button>
                </div>

                {isEditing && (
                  <div className="pt-3 border-t border-[#29332C] space-y-2.5">
                    <DiscordChannelSelector
                      label="Canal relacionado"
                      value={feat.channelId || channels[0]?.id || ''}
                      onChange={(chId) => updateBotFeature(feat.id, { channelId: chId })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'configuracao' && (
        <SettingsCard
          title="Parâmetros gerais do serviço do Bot"
          description="As credenciais sensíveis (Discord Bot Token e Public Key) devem residir exclusivamente no servidor backend."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-4 space-y-2">
              <div className="font-semibold text-[#F5F7F5] flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#A3FF12]" />
                Identidade do aplicativo Discord
              </div>
              <div className="flex justify-between text-[#9DA89F]">
                <span>Nome do bot:</span>
                <span className="text-[#F5F7F5] font-medium">{botConfig.botName}</span>
              </div>
              <div className="flex justify-between text-[#9DA89F]">
                <span>Versão esperada:</span>
                <span className="font-mono text-[#F5F7F5]">{botConfig.version}</span>
              </div>
              <div className="flex justify-between text-[#9DA89F]">
                <span>Intents necessários:</span>
                <span className="font-mono text-[#A3FF12]">Guilds, Members, Messages</span>
              </div>
            </div>

            <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-4 space-y-2">
              <div className="font-semibold text-[#F5F7F5] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#72A8FF]" />
                Segurança de token
              </div>
              <p className="text-[#9DA89F] leading-relaxed">
                Por segurança, tokens de bot nunca são inseridos ou armazenados no navegador. Após implantar o worker do bot no backend, o CRM consumirá o status via API autenticada.
              </p>
            </div>
          </div>
        </SettingsCard>
      )}

      {tab === 'eventos' && (
        <SettingsCard title="Eventos recentes simulados">
          <div className="divide-y divide-[#29332C]/70">
            {activities.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-[#F5F7F5]">{a.title}</div>
                  <div className="text-[#9DA89F] mt-0.5">{a.subtitle}</div>
                </div>
                <span className="text-[#9DA89F] tabular-nums">{formatDateTimeBR(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </SettingsCard>
      )}

      {tab === 'diagnostico' && (
        <SettingsCard title="Diagnóstico de prontidão do Bot">
          <div className="space-y-3 text-xs">
            {[
              {
                label: 'Gateway WebSocket Discord',
                status: 'Aguardando serviço backend',
                ok: false,
                icon: Cpu,
              },
              {
                label: 'Definições de comandos Slash',
                status: `${activeCommandsCount} comandos prontos para registro`,
                ok: true,
                icon: Terminal,
              },
              {
                label: 'Regras de Autorole e Verificação',
                status: 'Contratos configurados localmente',
                ok: true,
                icon: CheckCircle2,
              },
              {
                label: 'Auditoria e Logs de Moderação',
                status: 'Canal #logs-moderacao vinculado',
                ok: true,
                icon: ShieldAlert,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.ok ? 'text-[#36D475]' : 'text-[#F2B84B]'}`} />
                    <span className="font-medium text-[#F5F7F5]">{item.label}</span>
                  </div>
                  <StatusBadge label={item.status} tone={item.ok ? 'success' : 'warning'} />
                </div>
              );
            })}
          </div>
        </SettingsCard>
      )}
    </div>
  );
}
