import React, { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import {
  ConfirmationDialog,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SettingsCard,
  StatusBadge,
  ToggleSwitch,
} from '@/src/components/ui/Primitives';

type SettingsTab =
  | 'geral'
  | 'aparencia'
  | 'notificacoes'
  | 'discord'
  | 'seguranca'
  | 'integracoes'
  | 'preferencias'
  | 'sistema';

export function ConfiguracoesPage() {
  const { settings, updateSettings, resetDemoData, navigate } = useCRM();
  const [tab, setTab] = useState<SettingsTab>('geral');
  const [orgName, setOrgName] = useState(settings.organizationName);
  const [confirmReset, setConfirmReset] = useState(false);

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'geral', label: 'Geral' },
    { id: 'aparencia', label: 'Aparência' },
    { id: 'notificacoes', label: 'Notificações' },
    { id: 'discord', label: 'Discord' },
    { id: 'seguranca', label: 'Segurança' },
    { id: 'integracoes', label: 'Integrações' },
    { id: 'preferencias', label: 'Preferências' },
    { id: 'sistema', label: 'Sistema' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Configurações"
        subtitle="Parâmetros gerais da operação MapQuestfy CRM"
        actions={
          <SecondaryButton onClick={() => setConfirmReset(true)}>
            <RotateCcw className="w-4 h-4" />
            Restaurar dados demo
          </SecondaryButton>
        }
      />

      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#29332C] pb-1">
        {tabs.map((t) => (
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

      {tab === 'geral' && (
        <SettingsCard title="Identidade e localização da organização">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#9DA89F] mb-1">Nome da organização</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
              />
            </div>
            <div>
              <label className="block text-[#9DA89F] mb-1">Fuso horário operacional</label>
              <input
                type="text"
                readOnly
                value="America/Sao_Paulo (Horário de Brasília)"
                className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#9DA89F]"
              />
            </div>
            <div>
              <label className="block text-[#9DA89F] mb-1">Idioma padrão</label>
              <input
                type="text"
                readOnly
                value="Português brasileiro (pt-BR)"
                className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#9DA89F]"
              />
            </div>
            <div>
              <label className="block text-[#9DA89F] mb-1">Moeda e formato de data</label>
              <input
                type="text"
                readOnly
                value="BRL (R$) · DD/MM/AAAA"
                className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#9DA89F]"
              />
            </div>
          </div>
          <div className="mt-4">
            <PrimaryButton onClick={() => updateSettings({ organizationName: orgName })}>
              <Save className="w-4 h-4" />
              Salvar alterações
            </PrimaryButton>
          </div>
        </SettingsCard>
      )}

      {tab === 'aparencia' && (
        <SettingsCard title="Tema e densidade visual" description="Identidade visual oficial MapQuestfy Dark + Neon Lime">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F0C] border border-[#29332C]">
              <div>
                <div className="font-semibold text-[#F5F7F5]">Tema ativo</div>
                <div className="text-[#9DA89F]">Dark Mode Premium (#080B09) com destaque #A3FF12</div>
              </div>
              <StatusBadge label="MapQuestfy Dark" tone="accent" />
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F0C] border border-[#29332C]">
              <div>
                <div className="font-semibold text-[#F5F7F5]">Densidade da interface</div>
                <div className="text-[#9DA89F]">Ajuste o espaçamento de listas e tabelas</div>
              </div>
              <select
                value={settings.interfaceDensity}
                onChange={(e) =>
                  updateSettings({
                    interfaceDensity: e.target.value as 'confortavel' | 'compacta',
                  })
                }
                className="h-9 px-3 rounded-lg bg-[#111713] border border-[#29332C] text-[#F5F7F5]"
              >
                <option value="confortavel">Confortável</option>
                <option value="compacta">Compacta</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F0C] border border-[#29332C]">
              <div>
                <div className="font-semibold text-[#F5F7F5]">Iniciar com sidebar recolhida</div>
                <div className="text-[#9DA89F]">Preferência salva para próximas visitas no navegador</div>
              </div>
              <ToggleSwitch
                checked={settings.sidebarCollapsedDefault}
                onChange={() =>
                  updateSettings({ sidebarCollapsedDefault: !settings.sidebarCollapsedDefault })
                }
                label="Sidebar recolhida"
              />
            </div>
          </div>
        </SettingsCard>
      )}

      {tab === 'notificacoes' && (
        <SettingsCard title="Alertas e notificações do painel">
          <div className="space-y-3.5 text-xs">
            {[
              { key: 'adminAlerts' as const, title: 'Alertas administrativos', desc: 'Alterações de permissões e acessos críticos' },
              { key: 'supportEvents' as const, title: 'Eventos de atendimento', desc: 'Novas mensagens na Central de Atendimento' },
              { key: 'priorityTickets' as const, title: 'Tickets prioritários', desc: 'Abertura de tickets Alta ou Urgente' },
              { key: 'integrationFailures' as const, title: 'Falhas de integrações', desc: 'Conflitos de sincronização ou webhooks pendentes' },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F0C] border border-[#29332C]"
              >
                <div>
                  <div className="font-semibold text-[#F5F7F5]">{item.title}</div>
                  <div className="text-[#9DA89F]">{item.desc}</div>
                </div>
                <ToggleSwitch
                  checked={settings.notifications[item.key]}
                  onChange={() =>
                    updateSettings({
                      notifications: {
                        ...settings.notifications,
                        [item.key]: !settings.notifications[item.key],
                      },
                    })
                  }
                  label={item.title}
                />
              </div>
            ))}
          </div>
        </SettingsCard>
      )}

      {tab === 'discord' && (
        <SettingsCard title="Atalhos de configuração Discord">
          <p className="text-xs text-[#9DA89F] mb-4">
            Gerencie servidores, módulos do bot, cargos automáticos e comandos diretamente nos painéis dedicados.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <SecondaryButton onClick={() => navigate('/bot')}>Central do Bot</SecondaryButton>
            <SecondaryButton onClick={() => navigate('/cargos')}>Cargos Automáticos</SecondaryButton>
            <SecondaryButton onClick={() => navigate('/moderacao')}>Moderação</SecondaryButton>
            <SecondaryButton onClick={() => navigate('/comandos')}>Comandos Slash</SecondaryButton>
          </div>
        </SettingsCard>
      )}

      {tab === 'seguranca' && (
        <SettingsCard title="Políticas de segurança operacional">
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F0C] border border-[#29332C]">
              <div>
                <div className="font-semibold text-[#F5F7F5]">Exigir confirmação em ações críticas</div>
                <div className="text-[#9DA89F]">Revogação de administradores, banimentos e exclusões</div>
              </div>
              <ToggleSwitch
                checked={settings.security.requireConfirmCritical}
                onChange={() =>
                  updateSettings({
                    security: {
                      ...settings.security,
                      requireConfirmCritical: !settings.security.requireConfirmCritical,
                    },
                  })
                }
                label="Confirmação crítica"
              />
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F0C] border border-[#29332C]">
              <div>
                <div className="font-semibold text-[#F5F7F5]">Validação de permissões no backend</div>
                <div className="text-[#9DA89F]">Obrigatória quando APIs reais forem conectadas</div>
              </div>
              <StatusBadge label="Obrigatória por arquitetura" tone="success" />
            </div>
          </div>
        </SettingsCard>
      )}

      {tab === 'integracoes' && (
        <SettingsCard title="Conectores configurados">
          <p className="text-xs text-[#9DA89F] mb-4">
            Acesse a Central de Integrações para configurar contratos de Discord, Sharpify, Shadow Keys e CRM externo.
          </p>
          <PrimaryButton onClick={() => navigate('/integracoes')}>
            Abrir Central de Integrações
          </PrimaryButton>
        </SettingsCard>
      )}

      {tab === 'preferencias' && (
        <SettingsCard title="Preferências de navegação e produtividade">
          <p className="text-xs text-[#9DA89F]">
            Todas as preferências locais de visualização no modo demonstração são persistidas automaticamente no navegador sem incluir dados sensíveis.
          </p>
        </SettingsCard>
      )}

      {tab === 'sistema' && (
        <SettingsCard title="Informações do Sistema">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5">
              <div className="text-[#9DA89F]">Aplicação</div>
              <div className="font-semibold text-[#F5F7F5] mt-0.5">MapQuestfy CRM V1</div>
            </div>
            <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5">
              <div className="text-[#9DA89F]">Modo atual</div>
              <div className="font-semibold text-[#F2B84B] mt-0.5">
                Frontend Demonstração (sem backend conectado)
              </div>
            </div>
          </div>
        </SettingsCard>
      )}

      <ConfirmationDialog
        open={confirmReset}
        danger
        title="Restaurar dados de demonstração"
        description="Isso limpará as alterações locais de demonstração e restaurará o conjunto inicial de clientes, pedidos, tickets e configurações."
        confirmLabel="Restaurar agora"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}
