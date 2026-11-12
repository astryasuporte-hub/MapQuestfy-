import React, { useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MessageSquarePlus,
  Plus,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Ticket as TicketIcon,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useCRM } from '@/src/context/CRMContext';
import { SPARKLINE_MEMBERS, SPARKLINE_ORDERS } from '@/src/data/seedData';
import { AccessProfile, Ticket } from '@/src/types/crm';
import { adminAuthorizeSchema } from '@/src/schemas/validation';
import { formatNumberBR, formatRelativeTimeBR } from '@/src/services/formatters';
import {
  ConfirmationDialog,
  PrimaryButton,
  SearchInput,
  StatusBadge,
  ToggleSwitch,
  UserAvatar,
} from '@/src/components/ui/Primitives';

export function VisaoGeralPage() {
  const {
    selectedGuild,
    tickets,
    orders,
    activities,
    botConfig,
    toggleQuickBotSetting,
    admins,
    addAdminUser,
    updateAdminUser,
    revokeAdminUser,
    currentUser,
    navigate,
    updateTicket,
    pushToast,
  } = useCRM();

  // Admin quick form
  const [newDiscordId, setNewDiscordId] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminProfile, setNewAdminProfile] = useState<AccessProfile>('Administrador');
  const [idError, setIdError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; label: string } | null>(null);

  // Recent tickets table filter/detail
  const [ticketQuery, setTicketQuery] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('todos');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const openTickets = tickets.filter(
    (t) => t.status === 'Aberto' || t.status === 'Em atendimento' || t.status === 'Aguardando cliente'
  );
  const urgentTickets = openTickets.filter((t) => t.priority === 'Alta' || t.priority === 'Urgente').length;

  const filteredTickets = useMemo(() => {
    const q = ticketQuery.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesStatus = ticketStatusFilter === 'todos' || t.status === ticketStatusFilter;
      const matchesQuery =
        !q ||
        t.code.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [tickets, ticketQuery, ticketStatusFilter]);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setIdError(null);
    const cleanId = newDiscordId.trim();
    const display = newAdminName.trim() || `Admin ${cleanId.slice(-4)}`;
    const parsed = adminAuthorizeSchema.safeParse({
      discordId: cleanId,
      displayName: display,
      discordHandle: `@${display.toLowerCase().replace(/\s+/g, '')}`,
      profile: newAdminProfile,
    });
    if (!parsed.success) {
      setIdError(parsed.error.issues[0]?.message || 'Discord ID inválido.');
      return;
    }
    if (admins.some((a) => a.discordId === cleanId)) {
      setIdError('Este Discord ID já está autorizado.');
      return;
    }
    addAdminUser({
      discordId: cleanId,
      displayName: parsed.data.displayName,
      discordHandle: parsed.data.discordHandle,
      profile: parsed.data.profile,
    });
    setNewDiscordId('');
    setNewAdminName('');
  };

  const getTicketStatusBadge = (status: Ticket['status']) => {
    if (status === 'Em atendimento') return <StatusBadge label={status} tone="info" />;
    if (status === 'Aguardando cliente') return <StatusBadge label={status} tone="warning" />;
    if (status === 'Resolvido' || status === 'Fechado') return <StatusBadge label={status} tone="success" />;
    return <StatusBadge label={status} tone="accent" />;
  };

  const getPriorityTone = (p: Ticket['priority']) => {
    if (p === 'Urgente' || p === 'Alta') return 'error';
    if (p === 'Média') return 'warning';
    return 'neutral';
  };

  const getActivityIcon = (type: string) => {
    if (type === 'member_join') return <UserPlus className="w-4 h-4 text-[#72A8FF]" />;
    if (type === 'role_assigned') return <Users className="w-4 h-4 text-[#A3FF12]" />;
    if (type === 'order_approved') return <ShoppingCart className="w-4 h-4 text-[#A3FF12]" />;
    if (type === 'ticket_created' || type === 'ticket_resolved') return <TicketIcon className="w-4 h-4 text-[#A3FF12]" />;
    if (type === 'moderation') return <Shield className="w-4 h-4 text-[#F2B84B]" />;
    return <Activity className="w-4 h-4 text-[#72A8FF]" />;
  };

  // Monthly orders displayed matching 86 baseline + any new demo orders added
  const monthlyOrdersCount = 80 + orders.length;

  return (
    <div className="space-y-6">
      {/* KPI Row — 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Membros */}
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#294C10]/60 border border-[#74C900]/30 flex items-center justify-center text-[#A3FF12] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#9DA89F]">Membros</div>
              <div className="text-2xl font-display font-bold text-[#F5F7F5] tabular-nums mt-0.5">
                {formatNumberBR(selectedGuild.memberCount)}
              </div>
              <div className="text-[11px] font-medium text-[#36D475] tabular-nums mt-0.5">
                ▲ +73 (7d)
              </div>
            </div>
          </div>
          <div className="w-20 h-12 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPARKLINE_MEMBERS}>
                <defs>
                  <linearGradient id="mqSparkMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A3FF12" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#A3FF12" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#A3FF12"
                  strokeWidth={2}
                  fill="url(#mqSparkMembers)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Tickets abertos */}
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#294C10]/60 border border-[#74C900]/30 flex items-center justify-center text-[#A3FF12] shrink-0">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#9DA89F]">Tickets abertos</div>
              <div className="text-2xl font-display font-bold text-[#F5F7F5] tabular-nums mt-0.5">
                {openTickets.length + 9}
              </div>
              <div className="text-[11px] font-medium text-[#F06464] tabular-nums mt-0.5">
                {urgentTickets} alta prioridade · +3 (24h)
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="px-2.5 py-1.5 rounded-lg bg-[#171D18] border border-[#29332C] text-[11px] font-medium text-[#9DA89F] hover:text-[#F5F7F5] hover:border-[#A3FF12]/40 transition-colors cursor-pointer shrink-0"
          >
            Abrir fila
          </button>
        </div>

        {/* Card 3: Pedidos do mês */}
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#294C10]/60 border border-[#74C900]/30 flex items-center justify-center text-[#A3FF12] shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#9DA89F]">Pedidos do mês</div>
              <div className="text-2xl font-display font-bold text-[#F5F7F5] tabular-nums mt-0.5">
                {monthlyOrdersCount}
              </div>
              <div className="text-[11px] font-medium text-[#36D475] tabular-nums mt-0.5">
                ▲ +24% vs mês anterior
              </div>
            </div>
          </div>
          <div className="w-20 h-12 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPARKLINE_ORDERS}>
                <defs>
                  <linearGradient id="mqSparkOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A3FF12" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#A3FF12" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#A3FF12"
                  strokeWidth={2}
                  fill="url(#mqSparkOrders)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Status do Bot (Honest Demo State) */}
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#294C10]/60 border border-[#74C900]/30 flex items-center justify-center text-[#A3FF12] shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#9DA89F]">Status do bot</div>
              <div className="mt-1">
                <StatusBadge label="Modo Demonstração" tone="warning" showIcon />
              </div>
              <div className="text-[11px] text-[#9DA89F] mt-1 truncate">
                Aguardando serviço · {formatRelativeTimeBR(botConfig.lastHeartbeatAt)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/bot')}
            className="px-2.5 py-1.5 rounded-lg bg-[#171D18] border border-[#29332C] text-[11px] font-medium text-[#9DA89F] hover:text-[#F5F7F5] hover:border-[#A3FF12]/40 transition-colors cursor-pointer shrink-0"
          >
            Painel
          </button>
        </div>
      </div>

      {/* Middle 2-Column Section: Atividade recente + Configuração rápida & Administradores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Atividade recente */}
        <section className="lg:col-span-7 rounded-2xl bg-[#111713] border border-[#29332C] p-5 flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#A3FF12]" />
              <h2 className="text-lg font-display font-semibold text-[#F5F7F5]">
                Atividade recente
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/auditoria')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171D18] border border-[#29332C] text-xs font-medium text-[#F5F7F5] hover:border-[#A3FF12]/40 transition-colors cursor-pointer"
            >
              <span>Ver tudo</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#9DA89F]" />
            </button>
          </div>

          <div className="divide-y divide-[#29332C]/70 flex-1">
            {activities.slice(0, 6).map((act) => (
              <div
                key={act.id}
                className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#171D18] border border-[#29332C] flex items-center justify-center shrink-0">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#F5F7F5] truncate">{act.title}</div>
                    <div className="text-xs text-[#9DA89F] truncate mt-0.5">{act.subtitle}</div>
                  </div>
                </div>
                <div className="text-xs text-[#9DA89F] whitespace-nowrap shrink-0 tabular-nums">
                  {act.timestampLabel}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Configuração rápida + Administradores autorizados */}
        <section className="lg:col-span-5 rounded-2xl bg-[#111713] border border-[#29332C] p-5 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#A3FF12]" />
              <h2 className="text-lg font-display font-semibold text-[#F5F7F5]">
                Configuração rápida
              </h2>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  key: 'autoRole' as const,
                  icon: Users,
                  title: 'Cargo automático',
                  desc: 'Atribui cargo após compra aprovada (via Sharpify)',
                },
                {
                  key: 'welcomeMessage' as const,
                  icon: MessageSquarePlus,
                  title: 'Mensagem de boas-vindas',
                  desc: 'Envia Embed ao entrar no servidor',
                },
                {
                  key: 'antiSpam' as const,
                  icon: Shield,
                  title: 'Proteção anti-spam',
                  desc: 'Moderação automática e filtros de links',
                },
                {
                  key: 'ticketOpening' as const,
                  icon: TicketIcon,
                  title: 'Abertura de tickets',
                  desc: 'Habilita painel de suporte para membros',
                },
                {
                  key: 'adminLogs' as const,
                  icon: FileText,
                  title: 'Logs administrativos',
                  desc: 'Registra alterações e eventos no canal de logs',
                },
              ].map((item) => {
                const Icon = item.icon;
                const enabled = botConfig.quickToggles[item.key];
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 text-[#A3FF12] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#F5F7F5] leading-tight">
                          {item.title}
                        </div>
                        <div className="text-xs text-[#9DA89F] truncate mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={enabled}
                      onChange={() => {
                        toggleQuickBotSetting(item.key);
                        pushToast({
                          type: 'info',
                          title: `${item.title} ${!enabled ? 'ativado' : 'desativado'}`,
                        });
                      }}
                      label={item.title}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Administradores autorizados */}
          <div className="pt-4 border-t border-[#29332C]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-display font-semibold text-[#F5F7F5]">
                Administradores autorizados
              </h3>
              <button
                type="button"
                onClick={() => navigate('/permissoes')}
                className="text-xs text-[#A3FF12] hover:underline cursor-pointer"
              >
                Gerenciar matriz
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newDiscordId}
                  onChange={(e) => {
                    setNewDiscordId(e.target.value);
                    if (idError) setIdError(null);
                  }}
                  placeholder="ID do Discord (ex: 123456789012345678)"
                  className="flex-1 h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs font-mono text-[#F5F7F5] placeholder:text-[#9DA89F]/60 focus:border-[#A3FF12]/60 focus:outline-none"
                />
                <PrimaryButton type="submit" className="h-10 px-3.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar ID
                </PrimaryButton>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Nome (opcional)"
                  className="h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5] placeholder:text-[#9DA89F]/60 focus:border-[#A3FF12]/60 focus:outline-none"
                />
                <select
                  value={newAdminProfile}
                  onChange={(e) => setNewAdminProfile(e.target.value as AccessProfile)}
                  className="h-9 px-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5] focus:border-[#A3FF12]/60 focus:outline-none"
                >
                  {(['Administrador', 'Superadmin', 'Moderador', 'Suporte', 'Analista'] as AccessProfile[]).map(
                    (p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    )
                  )}
                </select>
              </div>
              {idError && <p className="text-xs text-[#F06464]">{idError}</p>}
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {admins.map((adm) => {
                const isSelf = adm.discordId === currentUser.discordId;
                return (
                  <div
                    key={adm.id}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs"
                  >
                    <span className="font-mono text-[#F5F7F5] tabular-nums">{adm.discordId}</span>
                    <select
                      value={adm.profile}
                      disabled={isSelf}
                      title={
                        isSelf
                          ? 'Você não pode alterar seu próprio nível de acesso'
                          : 'Alterar perfil de acesso'
                      }
                      onChange={(e) =>
                        updateAdminUser(adm.id, { profile: e.target.value as AccessProfile })
                      }
                      className="bg-transparent text-[11px] text-[#A3FF12] focus:outline-none disabled:opacity-60 cursor-pointer"
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
                        <option key={p} value={p} className="bg-[#111713] text-[#F5F7F5]">
                          {p}
                        </option>
                      ))}
                    </select>
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() =>
                          setRevokeTarget({ id: adm.id, label: `${adm.displayName} (${adm.discordId})` })
                        }
                        aria-label={`Revogar acesso de ${adm.discordId}`}
                        className="text-[#9DA89F] hover:text-[#F06464] transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom: Tickets recentes */}
      <section className="rounded-2xl bg-[#111713] border border-[#29332C] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <TicketIcon className="w-5 h-5 text-[#A3FF12]" />
            <h2 className="text-lg font-display font-semibold text-[#F5F7F5]">
              Tickets recentes
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput
              value={ticketQuery}
              onChange={setTicketQuery}
              placeholder="Filtrar tickets..."
              className="w-full sm:w-52"
            />
            <select
              value={ticketStatusFilter}
              onChange={(e) => setTicketStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5] focus:border-[#A3FF12]/60 focus:outline-none"
            >
              <option value="todos">Todos os status</option>
              <option value="Aberto">Aberto</option>
              <option value="Em atendimento">Em atendimento</option>
              <option value="Aguardando cliente">Aguardando cliente</option>
              <option value="Resolvido">Resolvido</option>
            </select>
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-[#171D18] border border-[#29332C] text-xs font-medium text-[#F5F7F5] hover:border-[#A3FF12]/40 transition-colors cursor-pointer"
            >
              <span>Ver todos</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#9DA89F]" />
            </button>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#A3FF12]">{t.code}</span>
                {getTicketStatusBadge(t.status)}
              </div>
              <div className="text-sm font-medium text-[#F5F7F5]">{t.subject}</div>
              <div className="flex items-center justify-between text-xs text-[#9DA89F]">
                <span>{t.customerName} · {t.assignee}</span>
                <span>{formatRelativeTimeBR(t.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#29332C] text-xs font-medium text-[#9DA89F]">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Cliente</th>
                <th className="py-3 px-3">Assunto</th>
                <th className="py-3 px-3">Responsável</th>
                <th className="py-3 px-3">Prioridade</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Atualizado</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29332C]/70 text-sm">
              {filteredTickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="hover:bg-[#171D18]/70 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono text-xs text-[#F5F7F5] tabular-nums">{t.code}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar src={t.customerAvatar} name={t.customerName} size="sm" />
                      <span className="font-medium text-[#F5F7F5]">{t.customerName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#F5F7F5]">{t.subject}</td>
                  <td className="py-3 px-3 text-[#9DA89F] text-xs">{t.assignee}</td>
                  <td className="py-3 px-3">
                    <StatusBadge label={t.priority} tone={getPriorityTone(t.priority)} />
                  </td>
                  <td className="py-3 px-3">{getTicketStatusBadge(t.status)}</td>
                  <td className="py-3 px-3 text-xs text-[#9DA89F] tabular-nums whitespace-nowrap">
                    {formatRelativeTimeBR(t.updatedAt)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(t);
                      }}
                      aria-label={`Abrir detalhes do ticket ${t.code}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#9DA89F] hover:text-[#A3FF12] hover:bg-[#171D18] cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ticket Quick Detail Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl bg-[#111713] border border-[#29332C] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#A3FF12]">
                    {selectedTicket.code}
                  </span>
                  {getTicketStatusBadge(selectedTicket.status)}
                </div>
                <h3 className="text-lg font-display font-bold text-[#F5F7F5] mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-[#9DA89F] hover:text-[#F5F7F5] hover:bg-[#171D18] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5">
              <div>
                <span className="text-[#9DA89F]">Cliente:</span>{' '}
                <span className="text-[#F5F7F5] font-medium">{selectedTicket.customerDiscord}</span>
              </div>
              <div>
                <span className="text-[#9DA89F]">Responsável:</span>{' '}
                <span className="text-[#F5F7F5] font-medium">{selectedTicket.assignee}</span>
              </div>
              <div>
                <span className="text-[#9DA89F]">Canal:</span>{' '}
                <span className="font-mono text-[#F5F7F5]">#{selectedTicket.channelName}</span>
              </div>
              <div>
                <span className="text-[#9DA89F]">Pedido:</span>{' '}
                <span className="font-mono text-[#A3FF12]">
                  {selectedTicket.relatedOrderNumber || '—'}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {selectedTicket.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl p-3 text-xs border ${
                    m.isInternalNote
                      ? 'bg-[#F2B84B]/10 border-[#F2B84B]/30'
                      : 'bg-[#0B0F0C] border-[#29332C]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#F5F7F5]">
                      {m.authorName}{' '}
                      {m.isInternalNote && (
                        <span className="text-[#F2B84B] font-normal">(Nota interna)</span>
                      )}
                    </span>
                    <span className="text-[11px] text-[#9DA89F]">
                      {formatRelativeTimeBR(m.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#F5F7F5]/90 leading-relaxed">{m.content}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#29332C]">
              {selectedTicket.status !== 'Resolvido' && (
                <button
                  type="button"
                  onClick={() => {
                    updateTicket(selectedTicket.id, { status: 'Resolvido' });
                    setSelectedTicket(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#36D475]/15 border border-[#36D475]/40 text-xs font-semibold text-[#36D475] hover:bg-[#36D475]/25 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Marcar como resolvido
                </button>
              )}
              <PrimaryButton
                onClick={() => {
                  setSelectedTicket(null);
                  navigate('/tickets');
                }}
                className="ml-auto text-xs"
              >
                Abrir na Central de Tickets
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Confirm revoke admin */}
      <ConfirmationDialog
        open={Boolean(revokeTarget)}
        danger
        title="Revogar acesso administrativo"
        description={`Deseja remover o Discord ID ${revokeTarget?.label || ''} da lista de administradores autorizados no modo demonstração?`}
        confirmLabel="Revogar acesso"
        onCancel={() => setRevokeTarget(null)}
        onConfirm={() => {
          if (revokeTarget) revokeAdminUser(revokeTarget.id);
          setRevokeTarget(null);
        }}
      />
    </div>
  );
}
