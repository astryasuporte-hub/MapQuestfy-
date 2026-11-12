import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Headphones,
  Lock,
  Paperclip,
  Plus,
  Send,
  Ticket as TicketIcon,
  UserCheck,
  X,
} from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { Conversation, TicketPriority } from '@/src/types/crm';
import { formatBRL, formatRelativeTimeBR } from '@/src/services/formatters';
import {
  EmptyState,
  PageHeader,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  StatusBadge,
  UserAvatar,
} from '@/src/components/ui/Primitives';

const QUICK_REPLIES = [
  'Olá! Já recebi seu atendimento e estou conferindo seu pedido agora mesmo.',
  'Pode confirmar o número do pedido ou e-mail utilizado na compra?',
  'Sua chave foi reenviada! Verifique também sua caixa de spam ou DM do Discord.',
];

export function AtendimentoPage() {
  const {
    conversations,
    customers,
    orders,
    tickets,
    currentUser,
    addConversationMessage,
    updateConversation,
    createConversation,
    addTicket,
    pushToast,
  } = useCRM();

  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [query, setQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('todos');
  const [onlyUnanswered, setOnlyUnanswered] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'lista' | 'chat' | 'contexto'>('lista');

  const [messageText, setMessageText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [newConvCustId, setNewConvCustId] = useState(customers[0]?.id || '');
  const [newConvChannel, setNewConvChannel] = useState<Conversation['channel']>('Discord DM');
  const [newConvText, setNewConvText] = useState('');

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      const mChannel = channelFilter === 'todos' || c.channel === channelFilter;
      const mUnanswered = !onlyUnanswered || c.status === 'Não lida' || c.unread;
      const mQuery =
        !q ||
        c.customerName.toLowerCase().includes(q) ||
        c.customerDiscord.toLowerCase().includes(q);
      return mChannel && mUnanswered && mQuery;
    });
  }, [conversations, query, channelFilter, onlyUnanswered]);

  const activeConv =
    conversations.find((c) => c.id === selectedId) || filteredConversations[0] || null;
  const activeCustomer = activeConv
    ? customers.find((c) => c.id === activeConv.customerId)
    : null;
  const customerOrders = activeCustomer
    ? orders.filter((o) => o.customerId === activeCustomer.id)
    : [];
  const customerTickets = activeCustomer
    ? tickets.filter((t) => t.customerId === activeCustomer.id)
    : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !messageText.trim()) return;
    addConversationMessage(activeConv.id, messageText.trim(), isInternal);
    setMessageText('');
  };

  const handleCreateTicketFromChat = () => {
    if (!activeConv) return;
    const t = addTicket({
      customerId: activeConv.customerId,
      customerName: activeConv.customerName,
      customerDiscord: activeConv.customerDiscord,
      customerAvatar: activeConv.customerAvatar,
      subject: `Atendimento via ${activeConv.channel}`,
      category: 'Suporte Técnico',
      assignee: activeConv.assignee === 'Não atribuído' ? currentUser.name : activeConv.assignee,
      priority: activeConv.priority,
      status: 'Em atendimento',
      messages: [
        {
          id: `tm-${Date.now()}`,
          authorName: activeConv.customerName,
          authorRole: 'cliente',
          content: activeConv.messages[0]?.content || 'Solicitação originada na Central de Atendimento.',
          isInternalNote: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    updateConversation(activeConv.id, { linkedTicketCode: t.code });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Central de Atendimento"
        subtitle="Inbox local demonstrativa (mensagens simuladas sem envio externo)"
        actions={
          <PrimaryButton onClick={() => setNewConvOpen(true)}>
            <Plus className="w-4 h-4" />
            Nova conversa (Demo)
          </PrimaryButton>
        }
      />

      {/* Mobile Switcher */}
      <div className="flex lg:hidden items-center gap-1 p-1 rounded-xl bg-[#111713] border border-[#29332C]">
        {(['lista', 'chat', 'contexto'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobilePanel(tab)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize cursor-pointer ${
              mobilePanel === tab
                ? 'bg-[#294C10] text-[#A3FF12]'
                : 'text-[#9DA89F]'
            }`}
          >
            {tab === 'lista' ? 'Conversas' : tab === 'chat' ? 'Chat' : 'Cliente'}
          </button>
        ))}
      </div>

      {/* 3-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-210px)] min-h-[560px]">
        {/* Left: Conversation List */}
        <section
          className={`lg:col-span-3 rounded-2xl bg-[#111713] border border-[#29332C] flex flex-col overflow-hidden ${
            mobilePanel === 'lista' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="p-3.5 border-b border-[#29332C] space-y-2.5">
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar conversa..." />
            <div className="flex items-center gap-2">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="flex-1 h-8 px-2 rounded-lg bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
              >
                <option value="todos">Todos canais</option>
                <option value="Ticket Discord">Ticket Discord</option>
                <option value="Discord DM">Discord DM</option>
                <option value="Sharpify Chat">Sharpify Chat</option>
                <option value="E-mail">E-mail</option>
              </select>
              <button
                type="button"
                onClick={() => setOnlyUnanswered((v) => !v)}
                className={`h-8 px-2.5 rounded-lg border text-xs font-medium cursor-pointer ${
                  onlyUnanswered
                    ? 'bg-[#A3FF12]/15 border-[#A3FF12]/50 text-[#A3FF12]'
                    : 'bg-[#0B0F0C] border-[#29332C] text-[#9DA89F]'
                }`}
              >
                Não lidas
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#29332C]/60">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#9DA89F]">
                Nenhuma conversa encontrada.
              </div>
            ) : (
              filteredConversations.map((cv) => {
                const isSelected = activeConv?.id === cv.id;
                const lastMsg = cv.messages[cv.messages.length - 1];
                return (
                  <button
                    key={cv.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(cv.id);
                      if (cv.unread) updateConversation(cv.id, { unread: false });
                      setMobilePanel('chat');
                    }}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#171D18]' : 'hover:bg-[#171D18]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar src={cv.customerAvatar} name={cv.customerName} size="sm" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#F5F7F5] truncate">
                            {cv.customerName}
                          </div>
                          <div className="text-[11px] text-[#9DA89F] truncate">{cv.channel}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#9DA89F] shrink-0">
                        {formatRelativeTimeBR(cv.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#9DA89F] truncate mt-2">
                      {lastMsg?.isInternal ? '[Nota interna] ' : ''}
                      {lastMsg?.content || 'Sem mensagens'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <StatusBadge
                        label={cv.status}
                        tone={cv.status === 'Finalizada' ? 'success' : cv.unread ? 'accent' : 'info'}
                      />
                      {cv.linkedTicketCode && (
                        <span className="font-mono text-[11px] text-[#A3FF12]">
                          {cv.linkedTicketCode}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Center: Active Thread */}
        <section
          className={`lg:col-span-6 rounded-2xl bg-[#111713] border border-[#29332C] flex flex-col overflow-hidden ${
            mobilePanel === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                icon={<Headphones className="w-5 h-5" />}
                title="Selecione uma conversa"
                description="Escolha um atendimento à esquerda ou crie uma conversa demonstrativa."
              />
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="px-4 py-3 border-b border-[#29332C] flex flex-wrap items-center justify-between gap-2 bg-[#0B0F0C]/60">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    src={activeConv.customerAvatar}
                    name={activeConv.customerName}
                    size="sm"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#F5F7F5]">
                      {activeConv.customerName}{' '}
                      <span className="text-xs font-normal text-[#9DA89F]">
                        ({activeConv.customerDiscord})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9DA89F]">
                      {activeConv.channel} · Responsável: {activeConv.assignee}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <SecondaryButton
                    onClick={() => {
                      updateConversation(activeConv.id, {
                        assignee: currentUser.name,
                        status: 'Em atendimento',
                      });
                      pushToast({ type: 'info', title: 'Atendimento assumido por você' });
                    }}
                    className="h-8 px-2.5 text-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Assumir
                  </SecondaryButton>
                  {activeConv.status !== 'Finalizada' && (
                    <SecondaryButton
                      onClick={() => {
                        updateConversation(activeConv.id, { status: 'Finalizada' });
                        pushToast({ type: 'success', title: 'Atendimento finalizado (Demo)' });
                      }}
                      className="h-8 px-2.5 text-xs text-[#36D475]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Finalizar
                    </SecondaryButton>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConv.messages.map((m) => {
                  const isStaff = m.sender === 'atendente';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs border ${
                          m.isInternal
                            ? 'bg-[#F2B84B]/12 border-[#F2B84B]/40 text-[#F5F7F5]'
                            : isStaff
                            ? 'bg-[#294C10]/60 border-[#74C900]/40 text-[#F5F7F5]'
                            : 'bg-[#0B0F0C] border-[#29332C] text-[#F5F7F5]'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-[11px] text-[#9DA89F] mb-1">
                          <span className="font-semibold text-[#F5F7F5]">{m.senderName}</span>
                          {m.isInternal && (
                            <span className="inline-flex items-center gap-1 text-[#F2B84B]">
                              <Lock className="w-3 h-3" /> Nota interna
                            </span>
                          )}
                          <span>· {formatRelativeTimeBR(m.createdAt)}</span>
                        </div>
                        <p className="leading-relaxed">{m.content}</p>
                        {m.attachmentName && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#080B09]/60 border border-[#29332C] text-[11px] text-[#72A8FF]">
                            <Paperclip className="w-3 h-3" />
                            {m.attachmentName}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Replies + Composer */}
              <div className="p-3.5 border-t border-[#29332C] bg-[#0B0F0C]/60 space-y-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {QUICK_REPLIES.map((qr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessageText(qr)}
                      className="px-2.5 py-1 rounded-lg bg-[#171D18] border border-[#29332C] text-[11px] text-[#9DA89F] hover:text-[#F5F7F5] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Resposta rápida #{idx + 1}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSend} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsInternal(false)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                          !isInternal
                            ? 'bg-[#A3FF12] text-[#080B09]'
                            : 'bg-[#171D18] text-[#9DA89F]'
                        }`}
                      >
                        Responder ao cliente
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInternal(true)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                          isInternal
                            ? 'bg-[#F2B84B] text-[#080B09]'
                            : 'bg-[#171D18] text-[#9DA89F]'
                        }`}
                      >
                        Nota interna
                      </button>
                    </div>
                    <span className="text-[11px] text-[#9DA89F]">Simulação local</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={
                        isInternal
                          ? 'Escrever nota interna visível apenas à equipe...'
                          : 'Digite sua resposta demonstrativa...'
                      }
                      className="flex-1 h-10 px-3 rounded-xl bg-[#080B09] border border-[#29332C] text-sm text-[#F5F7F5] focus:border-[#A3FF12]/60 focus:outline-none"
                    />
                    <PrimaryButton type="submit" className="h-10 px-4">
                      <Send className="w-4 h-4" />
                      Enviar
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            </>
          )}
        </section>

        {/* Right: Customer Context */}
        <section
          className={`lg:col-span-3 rounded-2xl bg-[#111713] border border-[#29332C] p-4 overflow-y-auto space-y-4 ${
            mobilePanel === 'contexto' ? 'block' : 'hidden lg:block'
          }`}
        >
          {activeConv && activeCustomer ? (
            <>
              <div>
                <h3 className="text-xs font-semibold text-[#9DA89F] mb-2">Dados do cliente</h3>
                <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3 space-y-1.5 text-xs">
                  <div className="font-semibold text-[#F5F7F5]">{activeCustomer.name}</div>
                  <div className="text-[#9DA89F]">{activeCustomer.email}</div>
                  <div className="font-mono text-[11px] text-[#A3FF12]">
                    {activeCustomer.discordId || 'Discord ID não vinculado'}
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[#9DA89F]">
                    <span>Total gasto:</span>
                    <span className="font-mono font-semibold text-[#F5F7F5]">
                      {formatBRL(activeCustomer.totalSpent)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transfer / Priority */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Responsável</label>
                  <select
                    value={activeConv.assignee}
                    onChange={(e) =>
                      updateConversation(activeConv.id, { assignee: e.target.value })
                    }
                    className="w-full h-9 px-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                  >
                    <option value="Não atribuído">Não atribuído</option>
                    <option value="Ref">Ref</option>
                    <option value="Bruno Almeida">Bruno Almeida</option>
                    <option value="Camila Duarte">Camila Duarte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Prioridade</label>
                  <select
                    value={activeConv.priority}
                    onChange={(e) =>
                      updateConversation(activeConv.id, {
                        priority: e.target.value as TicketPriority,
                      })
                    }
                    className="w-full h-9 px-2.5 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
                {!activeConv.linkedTicketCode && (
                  <SecondaryButton onClick={handleCreateTicketFromChat} className="w-full text-xs">
                    <TicketIcon className="w-3.5 h-3.5" />
                    Criar ticket a partir desta conversa
                  </SecondaryButton>
                )}
              </div>

              {/* Related Orders */}
              <div>
                <h3 className="text-xs font-semibold text-[#9DA89F] mb-2">
                  Pedidos relacionados ({customerOrders.length})
                </h3>
                <div className="space-y-2">
                  {customerOrders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-[#A3FF12]">
                          {o.orderNumber}
                        </span>
                        <span className="font-mono text-[#F5F7F5]">{formatBRL(o.total)}</span>
                      </div>
                      <div className="text-[11px] text-[#9DA89F] truncate mt-0.5">
                        {o.items[0]?.productName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Tickets */}
              <div>
                <h3 className="text-xs font-semibold text-[#9DA89F] mb-2">
                  Tickets ({customerTickets.length})
                </h3>
                <div className="space-y-2">
                  {customerTickets.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-2.5 text-xs flex items-center justify-between"
                    >
                      <span className="truncate text-[#F5F7F5]">
                        <strong className="font-mono text-[#A3FF12] mr-1">{t.code}</strong>
                        {t.subject}
                      </span>
                      <StatusBadge label={t.status} tone="info" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-[#9DA89F]">Selecione um atendimento para ver o contexto.</p>
          )}
        </section>
      </div>

      {/* Create Demo Conversation Modal */}
      {newConvOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#111713] border border-[#29332C] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-display font-bold text-[#F5F7F5]">
                Nova conversa demonstrativa
              </h2>
              <button
                type="button"
                onClick={() => setNewConvOpen(false)}
                className="text-[#9DA89F] hover:text-[#F5F7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newConvText.trim()) return;
                createConversation(newConvCustId, newConvChannel, newConvText.trim());
                setNewConvText('');
                setNewConvOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Cliente</label>
                <select
                  value={newConvCustId}
                  onChange={(e) => setNewConvCustId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Canal</label>
                <select
                  value={newConvChannel}
                  onChange={(e) => setNewConvChannel(e.target.value as Conversation['channel'])}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                >
                  <option value="Discord DM">Discord DM</option>
                  <option value="Ticket Discord">Ticket Discord</option>
                  <option value="Sharpify Chat">Sharpify Chat</option>
                  <option value="E-mail">E-mail</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Mensagem inicial</label>
                <textarea
                  rows={3}
                  required
                  value={newConvText}
                  onChange={(e) => setNewConvText(e.target.value)}
                  placeholder="Mensagem inicial da equipe..."
                  className="w-full p-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <SecondaryButton onClick={() => setNewConvOpen(false)}>Cancelar</SecondaryButton>
                <PrimaryButton type="submit">Criar conversa</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
