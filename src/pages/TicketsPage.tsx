import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Kanban,
  List,
  Lock,
  Plus,
  RotateCcw,
  Send,
  Settings,
  Ticket as TicketIcon,
  X,
} from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '@/src/types/crm';
import { ticketFormSchema } from '@/src/schemas/validation';
import { downloadTextFile, formatDateTimeBR, formatRelativeTimeBR } from '@/src/services/formatters';
import {
  DiscordChannelSelector,
  DiscordRoleSelector,
  EmptyState,
  PageHeader,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  SettingsCard,
  StatusBadge,
  ToggleSwitch,
  UserAvatar,
} from '@/src/components/ui/Primitives';

export function TicketsPage() {
  const {
    tickets,
    ticketConfig,
    addTicket,
    updateTicket,
    addTicketMessage,
    updateTicketConfig,
    pushToast,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'fila' | 'config'>('fila');
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [priorityFilter, setPriorityFilter] = useState('todas');

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyInternal, setReplyInternal] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [formState, setFormState] = useState({
    customerName: '',
    customerDiscord: '',
    subject: '',
    category: 'Ativação de Key' as TicketCategory,
    priority: 'Média' as TicketPriority,
    assignee: 'Ref',
    relatedOrderNumber: '',
    initialMessage: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      const mStatus = statusFilter === 'todos' || t.status === statusFilter;
      const mPrio = priorityFilter === 'todas' || t.priority === priorityFilter;
      const mQuery =
        !q ||
        t.code.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q);
      return mStatus && mPrio && mQuery;
    });
  }, [tickets, query, statusFilter, priorityFilter]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = ticketFormSchema.safeParse(formState);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Verifique os campos.');
      return;
    }
    const created = addTicket({
      customerName: parsed.data.customerName,
      customerDiscord: parsed.data.customerDiscord,
      subject: parsed.data.subject,
      category: parsed.data.category,
      priority: parsed.data.priority,
      assignee: parsed.data.assignee,
      relatedOrderNumber: parsed.data.relatedOrderNumber || undefined,
      status: 'Aberto',
      messages: [
        {
          id: `tm-${Date.now()}`,
          authorName: parsed.data.customerName,
          authorRole: 'cliente',
          content: parsed.data.initialMessage,
          isInternalNote: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setCreateOpen(false);
    setSelectedTicketId(created.id);
    setFormState({
      customerName: '',
      customerDiscord: '',
      subject: '',
      category: 'Ativação de Key',
      priority: 'Média',
      assignee: 'Ref',
      relatedOrderNumber: '',
      initialMessage: '',
    });
  };

  const handleExportTranscript = (t: Ticket) => {
    const lines = [
      `TRANSCRIÇÃO MAPQUESTFY CRM — TICKET ${t.code}`,
      `Assunto: ${t.subject}`,
      `Cliente: ${t.customerName} (${t.customerDiscord})`,
      `Categoria: ${t.category} | Prioridade: ${t.priority} | Status: ${t.status}`,
      `Canal: #${t.channelName}`,
      `Criado em: ${formatDateTimeBR(t.createdAt)}`,
      '------------------------------------------------------------',
      ...t.messages.map(
        (m) =>
          `[${formatDateTimeBR(m.createdAt)}] ${m.authorName}${
            m.isInternalNote ? ' [NOTA INTERNA]' : ''
          }: ${m.content}`
      ),
    ];
    downloadTextFile(`transcricao-${t.code.replace('#', '')}.txt`, lines.join('\n'));
    pushToast({ type: 'success', title: `Transcrição do ticket ${t.code} exportada` });
  };

  const statusTone = (s: TicketStatus) => {
    if (s === 'Em atendimento') return 'info';
    if (s === 'Aguardando cliente') return 'warning';
    if (s === 'Resolvido' || s === 'Fechado') return 'success';
    return 'accent';
  };

  const priorityTone = (p: TicketPriority) => {
    if (p === 'Urgente' || p === 'Alta') return 'error';
    if (p === 'Média') return 'warning';
    return 'neutral';
  };

  const kanbanStatuses: TicketStatus[] = [
    'Aberto',
    'Em atendimento',
    'Aguardando cliente',
    'Resolvido',
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tickets Discord"
        subtitle="Gestão de tickets, transcrições e configuração visual do painel Embed"
        actions={
          <>
            <div className="inline-flex rounded-xl bg-[#111713] border border-[#29332C] p-1">
              <button
                type="button"
                onClick={() => setActiveTab('fila')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  activeTab === 'fila' ? 'bg-[#294C10] text-[#A3FF12]' : 'text-[#9DA89F]'
                }`}
              >
                Fila de Tickets
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  activeTab === 'config' ? 'bg-[#294C10] text-[#A3FF12]' : 'text-[#9DA89F]'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Configurar Painel
              </button>
            </div>
            <PrimaryButton onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Novo ticket
            </PrimaryButton>
          </>
        }
      />

      {activeTab === 'fila' ? (
        <>
          {/* Filter Bar */}
          <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar por #código, assunto, cliente ou responsável..."
              className="w-full lg:w-80"
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
              >
                <option value="todos">Todos status</option>
                <option value="Aberto">Aberto</option>
                <option value="Em atendimento">Em atendimento</option>
                <option value="Aguardando cliente">Aguardando cliente</option>
                <option value="Resolvido">Resolvido</option>
                <option value="Fechado">Fechado</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
              >
                <option value="todas">Todas prioridades</option>
                <option value="Urgente">Urgente</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
              <div className="inline-flex rounded-xl bg-[#0B0F0C] border border-[#29332C] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('lista')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                    viewMode === 'lista' ? 'bg-[#171D18] text-[#A3FF12]' : 'text-[#9DA89F]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Lista
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                    viewMode === 'kanban' ? 'bg-[#171D18] text-[#A3FF12]' : 'text-[#9DA89F]'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  Kanban
                </button>
              </div>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <EmptyState
              icon={<TicketIcon className="w-5 h-5" />}
              title="Nenhum ticket encontrado"
              description="Crie um novo ticket de demonstração ou limpe os filtros aplicados."
            />
          ) : viewMode === 'lista' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className="rounded-2xl bg-[#111713] border border-[#29332C] hover:border-[#A3FF12]/40 p-4 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#A3FF12]">{t.code}</span>
                      <span className="text-xs text-[#9DA89F]">· {t.category}</span>
                    </div>
                    <StatusBadge label={t.status} tone={statusTone(t.status)} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F7F5]">{t.subject}</h3>
                    <p className="text-xs text-[#9DA89F] line-clamp-1 mt-0.5">
                      {t.messages[t.messages.length - 1]?.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#29332C]/70 text-xs">
                    <div className="flex items-center gap-2">
                      <UserAvatar src={t.customerAvatar} name={t.customerName} size="sm" />
                      <span className="text-[#F5F7F5]">{t.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge label={t.priority} tone={priorityTone(t.priority)} />
                      <span className="text-[#9DA89F]">{formatRelativeTimeBR(t.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {kanbanStatuses.map((colStatus) => {
                const colItems = filteredTickets.filter((t) => t.status === colStatus);
                return (
                  <div
                    key={colStatus}
                    className="rounded-2xl bg-[#111713] border border-[#29332C] p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#F5F7F5]">{colStatus}</span>
                      <span className="font-mono text-xs text-[#A3FF12] tabular-nums">
                        {colItems.length}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {colItems.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicketId(t.id)}
                          className="rounded-xl bg-[#0B0F0C] border border-[#29332C] hover:border-[#A3FF12]/40 p-3 space-y-2 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-[#A3FF12]">
                              {t.code}
                            </span>
                            <StatusBadge label={t.priority} tone={priorityTone(t.priority)} />
                          </div>
                          <div className="text-xs font-medium text-[#F5F7F5]">{t.subject}</div>
                          <div className="text-[11px] text-[#9DA89F]">
                            {t.customerName} · {t.assignee}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Ticket Configuration + Discord Embed Preview */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-4">
            <SettingsCard title="Canais e permissões do sistema de tickets">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <DiscordChannelSelector
                  label="Canal de abertura do painel"
                  value={ticketConfig.openingChannelId}
                  onChange={(v) => updateTicketConfig({ openingChannelId: v })}
                />
                <DiscordChannelSelector
                  label="Categoria do Discord"
                  typeFilter="category"
                  value={ticketConfig.discordCategoryId}
                  onChange={(v) => updateTicketConfig({ discordCategoryId: v })}
                />
                <DiscordRoleSelector
                  label="Cargo da equipe de suporte"
                  value={ticketConfig.supportRoleId}
                  onChange={(v) => updateTicketConfig({ supportRoleId: v })}
                />
                <DiscordChannelSelector
                  label="Canal de logs de tickets"
                  value={ticketConfig.logsChannelId}
                  onChange={(v) => updateTicketConfig({ logsChannelId: v })}
                />
                <div>
                  <label className="block text-xs font-medium text-[#9DA89F] mb-1.5">
                    Limite de tickets simultâneos por usuário
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={ticketConfig.maxTicketsPerUser}
                    onChange={(e) =>
                      updateTicketConfig({ maxTicketsPerUser: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm font-mono text-[#F5F7F5]"
                  />
                </div>
                <div className="flex flex-col justify-end gap-2.5 pb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#F5F7F5]">Gerar transcrição ao encerrar</span>
                    <ToggleSwitch
                      checked={ticketConfig.enableTranscript}
                      onChange={() =>
                        updateTicketConfig({ enableTranscript: !ticketConfig.enableTranscript })
                      }
                      label="Transcrição"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#F5F7F5]">Solicitar avaliação de atendimento</span>
                    <ToggleSwitch
                      checked={ticketConfig.enableRating}
                      onChange={() =>
                        updateTicketConfig({ enableRating: !ticketConfig.enableRating })
                      }
                      label="Avaliação"
                    />
                  </div>
                </div>
              </div>
            </SettingsCard>

            <SettingsCard title="Mensagens e conteúdo do painel">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Título do painel Embed</label>
                  <input
                    type="text"
                    value={ticketConfig.panelTitle}
                    onChange={(e) => updateTicketConfig({ panelTitle: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Descrição do painel</label>
                  <textarea
                    rows={3}
                    value={ticketConfig.panelDescription}
                    onChange={(e) => updateTicketConfig({ panelDescription: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#9DA89F] mb-1">Mensagem inicial no ticket</label>
                    <textarea
                      rows={2}
                      value={ticketConfig.initialMessage}
                      onChange={(e) => updateTicketConfig({ initialMessage: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9DA89F] mb-1">Mensagem de encerramento</label>
                    <textarea
                      rows={2}
                      value={ticketConfig.closingMessage}
                      onChange={(e) => updateTicketConfig({ closingMessage: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                    />
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>

          {/* Live Discord Embed Preview */}
          <div className="lg:col-span-5">
            <SettingsCard
              title="Prévia do Painel no Discord"
              description="Simulação visual da mensagem Embed que o bot publicará"
            >
              <div className="rounded-xl bg-[#313338] p-4 text-[#DBDEE1] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#080B09] flex items-center justify-center text-[10px] font-bold text-[#A3FF12]">
                    MQ
                  </div>
                  <span className="text-sm font-semibold text-white">MapQuestfy Guard</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#5865F2] text-[10px] font-semibold text-white">
                    APP
                  </span>
                  <span className="text-[11px] text-[#949BA4]">Hoje às 19:50</span>
                </div>

                {/* Embed Container */}
                <div
                  className="rounded-md bg-[#2B2D31] p-3.5 space-y-2"
                  style={{ borderLeft: `4px solid ${ticketConfig.panelColor}` }}
                >
                  <div className="text-sm font-bold text-white">{ticketConfig.panelTitle}</div>
                  <p className="text-xs text-[#DBDEE1]/90 leading-relaxed">
                    {ticketConfig.panelDescription}
                  </p>
                  <div className="text-[11px] text-[#949BA4] pt-1">
                    Limite: {ticketConfig.maxTicketsPerUser} ticket(s) ativo(s) ·{' '}
                    {ticketConfig.enableTranscript ? 'Transcrição automática' : 'Sem transcrição'}
                  </div>
                </div>

                {/* Discord Buttons */}
                <div className="flex flex-wrap gap-2">
                  {ticketConfig.panelButtons.map((btn, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        pushToast({
                          type: 'info',
                          title: `Prévia do botão "${btn.label}"`,
                          description: 'No servidor real, este botão abrirá um canal privado.',
                        })
                      }
                      className={`px-3 py-1.5 rounded text-xs font-medium text-white cursor-pointer ${
                        btn.style === 'success'
                          ? 'bg-[#248046]'
                          : btn.style === 'primary'
                          ? 'bg-[#5865F2]'
                          : 'bg-[#4E5058]'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </SettingsCard>
          </div>
        </div>
      )}

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#111713] border-l border-[#29332C] h-full flex flex-col">
            <div className="p-5 border-b border-[#29332C] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#A3FF12]">
                    {selectedTicket.code}
                  </span>
                  <StatusBadge label={selectedTicket.status} tone={statusTone(selectedTicket.status)} />
                  <StatusBadge
                    label={selectedTicket.priority}
                    tone={priorityTone(selectedTicket.priority)}
                  />
                </div>
                <h2 className="text-base font-display font-bold text-[#F5F7F5] mt-1">
                  {selectedTicket.subject}
                </h2>
                <div className="text-xs text-[#9DA89F] mt-0.5">
                  {selectedTicket.customerDiscord} · #{selectedTicket.channelName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicketId(null)}
                className="p-1.5 rounded-lg text-[#9DA89F] hover:text-[#F5F7F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Controls */}
            <div className="px-5 py-3 bg-[#0B0F0C] border-b border-[#29332C] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <select
                  value={selectedTicket.assignee}
                  onChange={(e) => updateTicket(selectedTicket.id, { assignee: e.target.value })}
                  className="h-8 px-2.5 rounded-lg bg-[#111713] border border-[#29332C] text-xs text-[#F5F7F5]"
                >
                  <option value="Ref">Ref</option>
                  <option value="Bruno Almeida">Bruno Almeida</option>
                  <option value="Camila Duarte">Camila Duarte</option>
                </select>
                <select
                  value={selectedTicket.priority}
                  onChange={(e) =>
                    updateTicket(selectedTicket.id, { priority: e.target.value as TicketPriority })
                  }
                  className="h-8 px-2.5 rounded-lg bg-[#111713] border border-[#29332C] text-xs text-[#F5F7F5]"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <SecondaryButton
                  onClick={() => handleExportTranscript(selectedTicket)}
                  className="h-8 px-2.5 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Transcrição
                </SecondaryButton>
                {selectedTicket.status === 'Resolvido' || selectedTicket.status === 'Fechado' ? (
                  <SecondaryButton
                    onClick={() => updateTicket(selectedTicket.id, { status: 'Em atendimento' })}
                    className="h-8 px-2.5 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reabrir
                  </SecondaryButton>
                ) : (
                  <PrimaryButton
                    onClick={() => updateTicket(selectedTicket.id, { status: 'Resolvido' })}
                    className="h-8 px-3 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Encerrar
                  </PrimaryButton>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {selectedTicket.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl p-3.5 text-xs border ${
                    m.isInternalNote
                      ? 'bg-[#F2B84B]/10 border-[#F2B84B]/35'
                      : m.authorRole === 'equipe'
                      ? 'bg-[#294C10]/35 border-[#74C900]/30'
                      : 'bg-[#0B0F0C] border-[#29332C]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#F5F7F5] inline-flex items-center gap-1.5">
                      {m.authorName}
                      {m.isInternalNote && (
                        <span className="text-[#F2B84B] font-normal inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Nota interna
                        </span>
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

            {/* Reply */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyText.trim()) return;
                addTicketMessage(selectedTicket.id, replyText.trim(), replyInternal);
                setReplyText('');
              }}
              className="p-4 border-t border-[#29332C] bg-[#0B0F0C] space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReplyInternal(false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    !replyInternal ? 'bg-[#A3FF12] text-[#080B09]' : 'bg-[#171D18] text-[#9DA89F]'
                  }`}
                >
                  Mensagem no ticket
                </button>
                <button
                  type="button"
                  onClick={() => setReplyInternal(true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    replyInternal ? 'bg-[#F2B84B] text-[#080B09]' : 'bg-[#171D18] text-[#9DA89F]'
                  }`}
                >
                  Nota interna
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Responder no ticket (simulação local)..."
                  className="flex-1 h-10 px-3 rounded-xl bg-[#111713] border border-[#29332C] text-sm text-[#F5F7F5]"
                />
                <PrimaryButton type="submit">
                  <Send className="w-4 h-4" />
                  Enviar
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#111713] border border-[#29332C] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-[#F5F7F5]">
                Abrir novo ticket (Modo demonstração)
              </h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="text-[#9DA89F] hover:text-[#F5F7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Nome do cliente</label>
                  <input
                    type="text"
                    required
                    value={formState.customerName}
                    onChange={(e) => setFormState((s) => ({ ...s, customerName: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">@ Discord</label>
                  <input
                    type="text"
                    required
                    value={formState.customerDiscord}
                    onChange={(e) => setFormState((s) => ({ ...s, customerDiscord: e.target.value }))}
                    placeholder="@usuario"
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Assunto</label>
                <input
                  type="text"
                  required
                  value={formState.subject}
                  onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Categoria</label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, category: e.target.value as TicketCategory }))
                    }
                    className="w-full h-10 px-2 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                  >
                    {ticketConfig.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Prioridade</label>
                  <select
                    value={formState.priority}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, priority: e.target.value as TicketPriority }))
                    }
                    className="w-full h-10 px-2 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Pedido (opc.)</label>
                  <input
                    type="text"
                    value={formState.relatedOrderNumber}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, relatedOrderNumber: e.target.value }))
                    }
                    placeholder="#MQ-..."
                    className="w-full h-10 px-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs font-mono text-[#F5F7F5]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Descrição inicial</label>
                <textarea
                  rows={3}
                  required
                  value={formState.initialMessage}
                  onChange={(e) => setFormState((s) => ({ ...s, initialMessage: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                />
              </div>
              {formError && <p className="text-xs text-[#F06464]">{formError}</p>}
              <div className="flex justify-end gap-2">
                <SecondaryButton onClick={() => setCreateOpen(false)}>Cancelar</SecondaryButton>
                <PrimaryButton type="submit">Criar ticket</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
