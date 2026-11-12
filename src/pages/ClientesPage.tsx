import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Edit3,
  Link2,
  Plus,
  StickyNote,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { Customer, DataSourceOrigin } from '@/src/types/crm';
import { customerFormSchema, discordIdSchema } from '@/src/schemas/validation';
import { downloadTextFile, formatBRL, formatDateTimeBR } from '@/src/services/formatters';
import { DataTable, DataTableColumn } from '@/src/components/ui/DataTable';
import {
  EmptyState,
  PageHeader,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  SettingsCard,
  StatusBadge,
  UserAvatar,
} from '@/src/components/ui/Primitives';

export function ClientesPage() {
  const {
    customers,
    orders,
    tickets,
    conversations,
    selectedCustomerId,
    setSelectedCustomerId,
    addCustomer,
    updateCustomer,
    addCustomerNote,
    pushToast,
  } = useCRM();

  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    discordId: '',
    discordHandle: '',
    source: 'Manual' as DataSourceOrigin,
    status: 'Ativo' as Customer['status'],
    tagsText: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Customer Detail View States
  const [detailTab, setDetailTab] = useState<
    'visao' | 'pedidos' | 'tickets' | 'conversas' | 'historico' | 'notas' | 'integracoes'
  >('visao');
  const [newTag, setNewTag] = useState('');
  const [newNote, setNewNote] = useState('');
  const [linkDiscordInput, setLinkDiscordInput] = useState('');
  const [linkHandleInput, setLinkHandleInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      const matchSource = sourceFilter === 'todas' || c.source === sourceFilter;
      const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.discordHandle?.toLowerCase().includes(q) ?? false) ||
        (c.discordId?.includes(q) ?? false) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      return matchSource && matchStatus && matchQuery;
    });
  }, [customers, query, sourceFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormState({
      name: '',
      email: '',
      phone: '',
      discordId: '',
      discordHandle: '',
      source: 'Manual',
      status: 'Ativo',
      tagsText: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormState({
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      discordId: c.discordId || '',
      discordHandle: c.discordHandle || '',
      source: c.source,
      status: c.status,
      tagsText: c.tags.join(', '),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customerFormSchema.safeParse(formState);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Verifique os campos informados.');
      return;
    }
    const tags = (parsed.data.tagsText || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || undefined,
        discordId: parsed.data.discordId || undefined,
        discordHandle: parsed.data.discordHandle || undefined,
        source: parsed.data.source,
        status: parsed.data.status,
        tags,
      });
    } else {
      addCustomer({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || undefined,
        discordId: parsed.data.discordId || undefined,
        discordHandle: parsed.data.discordHandle || undefined,
        source: parsed.data.source,
        status: parsed.data.status,
        tags,
      });
    }
    setModalOpen(false);
  };

  const handleExportCSV = () => {
    const list =
      selectedIds.length > 0
        ? customers.filter((c) => selectedIds.includes(c.id))
        : filteredCustomers;
    const header = 'ID,Nome,Email,DiscordID,DiscordHandle,Origem,Pedidos,TotalGastoBRL,Status';
    const rows = list.map((c) =>
      [
        c.id,
        `"${c.name}"`,
        c.email,
        c.discordId || '',
        c.discordHandle || '',
        c.source,
        c.ordersCount,
        c.totalSpent.toFixed(2),
        c.status,
      ].join(',')
    );
    downloadTextFile('mapquestfy-clientes.csv', [header, ...rows].join('\n'), 'text/csv;charset=utf-8');
    pushToast({ type: 'success', title: `${list.length} cliente(s) exportado(s) em CSV` });
  };

  const statusTone = (status: Customer['status']) => {
    if (status === 'VIP') return 'accent';
    if (status === 'Ativo') return 'success';
    if (status === 'Em risco') return 'warning';
    return 'error';
  };

  // Detailed Customer View
  if (selectedCustomer) {
    const custOrders = orders.filter((o) => o.customerId === selectedCustomer.id);
    const custTickets = tickets.filter((t) => t.customerId === selectedCustomer.id);
    const custConvs = conversations.filter((cv) => cv.customerId === selectedCustomer.id);
    const isRecurring = selectedCustomer.ordersCount > 1;

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedCustomerId(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#9DA89F] hover:text-[#F5F7F5] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para listagem de clientes
          </button>
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={() => openEditModal(selectedCustomer)}>
              <Edit3 className="w-4 h-4" />
              Editar cadastro
            </SecondaryButton>
          </div>
        </div>

        {/* Conflict alert if any */}
        {selectedCustomer.syncConflict && (
          <div className="rounded-xl bg-[#F2B84B]/10 border border-[#F2B84B]/35 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F2B84B] shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-semibold text-[#F5F7F5]">Conflito de sincronização preservado</div>
              <p className="text-[#9DA89F] mt-0.5">
                {selectedCustomer.syncConflict} Referências originais mantidas separadas para evitar unificação indevida.
              </p>
            </div>
          </div>
        )}

        {/* Summary Header Card */}
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <UserAvatar src={selectedCustomer.avatarUrl} name={selectedCustomer.name} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-display font-bold text-[#F5F7F5]">
                    {selectedCustomer.name}
                  </h1>
                  <StatusBadge label={selectedCustomer.status} tone={statusTone(selectedCustomer.status)} />
                  {isRecurring && <StatusBadge label="Cliente Recorrente" tone="info" />}
                </div>
                <div className="text-sm text-[#9DA89F] mt-1">
                  {selectedCustomer.email}
                  {selectedCustomer.phone && ` · ${selectedCustomer.phone}`}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#9DA89F]">
                  <span>
                    Discord:{' '}
                    <strong className="text-[#F5F7F5] font-medium">
                      {selectedCustomer.discordHandle || 'Não vinculado'}
                    </strong>
                  </span>
                  {selectedCustomer.discordId && (
                    <span className="font-mono tabular-nums">ID: {selectedCustomer.discordId}</span>
                  )}
                  <span>Origem principal: {selectedCustomer.source}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#29332C]">
              <div>
                <div className="text-xs text-[#9DA89F]">Total gasto</div>
                <div className="text-lg font-display font-bold text-[#A3FF12] tabular-nums mt-0.5">
                  {formatBRL(selectedCustomer.totalSpent)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#9DA89F]">Pedidos</div>
                <div className="text-lg font-display font-bold text-[#F5F7F5] tabular-nums mt-0.5">
                  {selectedCustomer.ordersCount}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#9DA89F]">1º atendimento</div>
                <div className="text-xs font-medium text-[#F5F7F5] tabular-nums mt-1.5">
                  {formatDateTimeBR(selectedCustomer.firstContactAt)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#9DA89F]">Última interação</div>
                <div className="text-xs font-medium text-[#F5F7F5] tabular-nums mt-1.5">
                  {formatDateTimeBR(selectedCustomer.lastInteractionAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Tags & Responsible */}
          <div className="mt-5 pt-4 border-t border-[#29332C]/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#9DA89F]" />
              {selectedCustomer.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#171D18] border border-[#29332C] text-xs text-[#F5F7F5]"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() =>
                      updateCustomer(selectedCustomer.id, {
                        tags: selectedCustomer.tags.filter((t) => t !== tag),
                      })
                    }
                    className="text-[#9DA89F] hover:text-[#F06464] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTag.trim()) return;
                  if (!selectedCustomer.tags.includes(newTag.trim())) {
                    updateCustomer(selectedCustomer.id, {
                      tags: [...selectedCustomer.tags, newTag.trim()],
                    });
                  }
                  setNewTag('');
                }}
                className="inline-flex items-center gap-1"
              >
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="+ Nova etiqueta"
                  className="h-7 w-28 px-2 rounded-lg bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5] focus:border-[#A3FF12]/60 focus:outline-none"
                />
              </form>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#9DA89F]">Atendente responsável:</span>
              <select
                value={selectedCustomer.assignedAgent || ''}
                onChange={(e) =>
                  updateCustomer(selectedCustomer.id, { assignedAgent: e.target.value || undefined })
                }
                className="h-8 px-2.5 rounded-lg bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
              >
                <option value="">Não atribuído</option>
                <option value="Ref">Ref</option>
                <option value="Bruno Almeida">Bruno Almeida</option>
                <option value="Camila Duarte">Camila Duarte</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#29332C]">
          {(
            [
              { id: 'visao', label: 'Visão geral' },
              { id: 'pedidos', label: `Pedidos (${custOrders.length})` },
              { id: 'tickets', label: `Tickets (${custTickets.length})` },
              { id: 'conversas', label: `Conversas (${custConvs.length})` },
              { id: 'historico', label: 'Histórico' },
              { id: 'notas', label: `Notas internas (${selectedCustomer.notes.length})` },
              { id: 'integracoes', label: `Integrações (${selectedCustomer.externalReferences.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDetailTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-t-xl border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                detailTab === tab.id
                  ? 'border-[#A3FF12] text-[#A3FF12] bg-[#111713]'
                  : 'border-transparent text-[#9DA89F] hover:text-[#F5F7F5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {detailTab === 'visao' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SettingsCard title="Vincular conta Discord" description="Associe manualmente um Discord ID validado (até 20 dígitos)">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setLinkError(null);
                  const res = discordIdSchema.safeParse(linkDiscordInput);
                  if (!res.success) {
                    setLinkError(res.error.issues[0]?.message || 'ID inválido');
                    return;
                  }
                  updateCustomer(selectedCustomer.id, {
                    discordId: res.data,
                    discordHandle: linkHandleInput.trim() || selectedCustomer.discordHandle || `@user_${res.data.slice(-4)}`,
                  });
                  setLinkDiscordInput('');
                  setLinkHandleInput('');
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={linkDiscordInput}
                    onChange={(e) => setLinkDiscordInput(e.target.value)}
                    placeholder="Discord ID (17-20 dígitos)"
                    className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs font-mono text-[#F5F7F5]"
                  />
                  <input
                    type="text"
                    value={linkHandleInput}
                    onChange={(e) => setLinkHandleInput(e.target.value)}
                    placeholder="@usuario (ex: @KaioDias)"
                    className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                  />
                </div>
                {linkError && <p className="text-xs text-[#F06464]">{linkError}</p>}
                <PrimaryButton type="submit" className="text-xs">
                  <Link2 className="w-3.5 h-3.5" />
                  Salvar vínculo Discord
                </PrimaryButton>
              </form>
            </SettingsCard>

            <SettingsCard title="Identidades externas preservadas" description="Cada fonte mantém seu ID original sem sobrescrita automática">
              <div className="space-y-2.5">
                {selectedCustomer.externalReferences.map((ref, idx) => (
                  <div
                    key={`${ref.source}-${idx}`}
                    className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#F5F7F5]">{ref.source}</div>
                      <div className="text-[11px] font-mono text-[#A3FF12] mt-0.5">{ref.externalId}</div>
                      {ref.conflictNote && (
                        <div className="text-[11px] text-[#F2B84B] mt-1">{ref.conflictNote}</div>
                      )}
                    </div>
                    <span className="text-[11px] text-[#9DA89F] tabular-nums">
                      {formatDateTimeBR(ref.syncedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </SettingsCard>
          </div>
        )}

        {detailTab === 'pedidos' && (
          <SettingsCard title="Pedidos do cliente">
            {custOrders.length === 0 ? (
              <EmptyState title="Nenhum pedido registrado" description="Este cliente ainda não possui pedidos vinculados." />
            ) : (
              <div className="space-y-2.5">
                {custOrders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-[#A3FF12]">{o.orderNumber}</div>
                      <div className="text-xs text-[#F5F7F5] mt-0.5">
                        {o.items.map((i) => i.productName).join(', ')}
                      </div>
                      <div className="text-[11px] text-[#9DA89F] mt-0.5">
                        Origem: {o.source} · {formatDateTimeBR(o.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge label={o.paymentStatus} tone={o.paymentStatus === 'Aprovado' ? 'success' : 'warning'} />
                      <span className="font-mono text-sm font-semibold text-[#F5F7F5] tabular-nums">
                        {formatBRL(o.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SettingsCard>
        )}

        {detailTab === 'tickets' && (
          <SettingsCard title="Tickets vinculados">
            {custTickets.length === 0 ? (
              <EmptyState title="Sem tickets" description="Nenhum ticket encontrado para este cliente." />
            ) : (
              <div className="space-y-2.5">
                {custTickets.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#F5F7F5]">
                        <span className="font-mono text-[#A3FF12] mr-2">{t.code}</span>
                        {t.subject}
                      </div>
                      <div className="text-[11px] text-[#9DA89F] mt-0.5">
                        Responsável: {t.assignee} · Atualizado em {formatDateTimeBR(t.updatedAt)}
                      </div>
                    </div>
                    <StatusBadge label={t.status} tone={t.status === 'Resolvido' ? 'success' : 'info'} />
                  </div>
                ))}
              </div>
            )}
          </SettingsCard>
        )}

        {detailTab === 'conversas' && (
          <SettingsCard title="Conversas de atendimento">
            {custConvs.length === 0 ? (
              <EmptyState title="Sem conversas" description="Nenhuma conversa iniciada com este cliente." />
            ) : (
              <div className="space-y-2.5">
                {custConvs.map((cv) => (
                  <div key={cv.id} className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#F5F7F5]">{cv.channel}</span>
                      <StatusBadge label={cv.status} tone="info" />
                    </div>
                    <p className="text-xs text-[#9DA89F] mt-1">
                      Última mensagem: {cv.messages[cv.messages.length - 1]?.content || '—'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SettingsCard>
        )}

        {detailTab === 'historico' && (
          <SettingsCard title="Linha do tempo do relacionamento">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#29332C]/70">
                <span className="text-[#F5F7F5]">Cadastro inicial ({selectedCustomer.source})</span>
                <span className="text-[#9DA89F] tabular-nums">{formatDateTimeBR(selectedCustomer.createdAt)}</span>
              </div>
              {custOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#29332C]/70">
                  <span className="text-[#F5F7F5]">Pedido {o.orderNumber} ({o.paymentStatus})</span>
                  <span className="text-[#9DA89F] tabular-nums">{formatDateTimeBR(o.createdAt)}</span>
                </div>
              ))}
              {custTickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-[#29332C]/70">
                  <span className="text-[#F5F7F5]">Ticket {t.code}: {t.subject}</span>
                  <span className="text-[#9DA89F] tabular-nums">{formatDateTimeBR(t.createdAt)}</span>
                </div>
              ))}
            </div>
          </SettingsCard>
        )}

        {detailTab === 'notas' && (
          <SettingsCard title="Notas internas da equipe" description="Visíveis apenas para operadores autorizados no CRM">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newNote.trim()) return;
                addCustomerNote(selectedCustomer.id, newNote.trim());
                setNewNote('');
              }}
              className="space-y-3 mb-4"
            >
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Registrar observação interna sobre este cliente..."
                className="w-full p-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5] focus:border-[#A3FF12]/60 focus:outline-none"
              />
              <PrimaryButton type="submit" className="text-xs">
                <StickyNote className="w-3.5 h-3.5" />
                Adicionar nota interna
              </PrimaryButton>
            </form>
            <div className="space-y-2.5">
              {selectedCustomer.notes.length === 0 ? (
                <p className="text-xs text-[#9DA89F]">Nenhuma nota interna registrada ainda.</p>
              ) : (
                selectedCustomer.notes.map((n) => (
                  <div key={n.id} className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3">
                    <div className="flex items-center justify-between text-[11px] text-[#9DA89F] mb-1">
                      <span className="font-semibold text-[#F5F7F5]">{n.authorName}</span>
                      <span className="tabular-nums">{formatDateTimeBR(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#F5F7F5]/90">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </SettingsCard>
        )}

        {detailTab === 'integracoes' && (
          <SettingsCard title="Referências de origem e IDs externos" description="Contratos preparados para sincronização futura sem fusão automática por nome">
            <div className="space-y-3">
              {selectedCustomer.externalReferences.map((ref, i) => (
                <div key={i} className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#F5F7F5]">{ref.source}</span>
                    <span className="font-mono text-xs text-[#A3FF12]">{ref.externalId}</span>
                  </div>
                  <div className="text-xs text-[#9DA89F]">{ref.label}</div>
                  {ref.conflictNote && (
                    <div className="text-xs text-[#F2B84B] pt-1">{ref.conflictNote}</div>
                  )}
                </div>
              ))}
            </div>
          </SettingsCard>
        )}
      </div>
    );
  }

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'name',
      header: 'Cliente',
      sortable: true,
      sortValue: (c) => c.name,
      render: (c) => (
        <div className="flex items-center gap-3">
          <UserAvatar src={c.avatarUrl} name={c.name} size="sm" />
          <div className="min-w-0">
            <div className="font-medium text-[#F5F7F5] truncate">{c.name}</div>
            <div className="text-xs text-[#9DA89F] truncate">{c.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'discord',
      header: 'Discord vinculado',
      render: (c) =>
        c.discordHandle ? (
          <div>
            <div className="text-xs font-medium text-[#F5F7F5]">{c.discordHandle}</div>
            {c.discordId && (
              <div className="text-[11px] font-mono text-[#9DA89F] tabular-nums">{c.discordId}</div>
            )}
          </div>
        ) : (
          <span className="text-xs text-[#9DA89F]">Não vinculado</span>
        ),
    },
    {
      key: 'source',
      header: 'Origem',
      sortable: true,
      sortValue: (c) => c.source,
      render: (c) => <StatusBadge label={c.source} tone="neutral" />,
    },
    {
      key: 'orders',
      header: 'Pedidos',
      align: 'right',
      sortable: true,
      sortValue: (c) => c.ordersCount,
      render: (c) => <span className="font-mono tabular-nums text-[#F5F7F5]">{c.ordersCount}</span>,
    },
    {
      key: 'spent',
      header: 'Total gasto',
      align: 'right',
      sortable: true,
      sortValue: (c) => c.totalSpent,
      render: (c) => (
        <span className="font-mono tabular-nums font-medium text-[#A3FF12]">
          {formatBRL(c.totalSpent)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge label={c.status} tone={statusTone(c.status)} />
          {c.syncConflict && (
            <span title={c.syncConflict} className="text-[#F2B84B]">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clientes"
        subtitle="Base unificada com preservação de IDs externos e histórico de atendimento"
        actions={
          <>
            <SecondaryButton onClick={handleExportCSV}>
              <Download className="w-4 h-4" />
              Exportar CSV {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </SecondaryButton>
            <PrimaryButton onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              Novo cliente
            </PrimaryButton>
          </>
        }
      />

      {/* Filter Bar */}
      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder="Buscar por nome, e-mail, @Discord, ID ou etiqueta..."
          className="w-full md:w-80"
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
          >
            <option value="todas">Todas as origens</option>
            <option value="Sharpify">Sharpify</option>
            <option value="Shadow Keys">Shadow Keys</option>
            <option value="CRM externo">CRM externo</option>
            <option value="Manual">Manual</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
          >
            <option value="todos">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="VIP">VIP</option>
            <option value="Em risco">Em risco</option>
            <option value="Bloqueado">Bloqueado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 sm:p-5">
        <DataTable
          data={paginatedCustomers}
          columns={columns}
          selectable
          selectedIds={selectedIds}
          onToggleSelect={(id) =>
            setSelectedIds((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
            )
          }
          onToggleSelectAll={() =>
            setSelectedIds((prev) =>
              prev.length === paginatedCustomers.length ? [] : paginatedCustomers.map((c) => c.id)
            )
          }
          onRowClick={(c) => {
            setSelectedCustomerId(c.id);
            setDetailTab('visao');
          }}
          emptyFallback={
            <EmptyState
              icon={<Users className="w-5 h-5" />}
              title="Nenhum cliente encontrado"
              description="Ajuste os filtros ou cadastre um novo cliente manualmente no modo demonstração."
              action={<PrimaryButton onClick={openCreateModal}>Cadastrar cliente</PrimaryButton>}
            />
          }
          renderMobileCard={(c) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar src={c.avatarUrl} name={c.name} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#F5F7F5] truncate">{c.name}</div>
                    <div className="text-xs text-[#9DA89F] truncate">{c.discordHandle || c.email}</div>
                  </div>
                </div>
                <StatusBadge label={c.status} tone={statusTone(c.status)} />
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#29332C]/60">
                <span className="text-[#9DA89F]">
                  {c.source} · {c.ordersCount} pedidos
                </span>
                <span className="font-mono font-semibold text-[#A3FF12] tabular-nums">
                  {formatBRL(c.totalSpent)}
                </span>
              </div>
            </div>
          )}
        />

        {/* Pagination */}
        {filteredCustomers.length > pageSize && (
          <div className="mt-4 pt-4 border-t border-[#29332C] flex items-center justify-between text-xs text-[#9DA89F]">
            <span>
              Mostrando {paginatedCustomers.length} de {filteredCustomers.length} clientes
            </span>
            <div className="flex items-center gap-2">
              <SecondaryButton
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 px-3 text-xs"
              >
                Anterior
              </SecondaryButton>
              <span className="tabular-nums">
                Página {page} de {totalPages}
              </span>
              <SecondaryButton
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-3 text-xs"
              >
                Próxima
              </SecondaryButton>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl bg-[#111713] border border-[#29332C] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-[#F5F7F5]">
                {editingCustomer ? 'Editar cliente' : 'Novo cliente (Modo demonstração)'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#9DA89F] hover:text-[#F5F7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Nome completo</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Discord ID (opcional)</label>
                  <input
                    type="text"
                    value={formState.discordId}
                    onChange={(e) => setFormState((s) => ({ ...s, discordId: e.target.value }))}
                    placeholder="17 a 20 dígitos"
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs font-mono text-[#F5F7F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">@ Discord (opcional)</label>
                  <input
                    type="text"
                    value={formState.discordHandle}
                    onChange={(e) => setFormState((s) => ({ ...s, discordHandle: e.target.value }))}
                    placeholder="@usuario"
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Origem</label>
                  <select
                    value={formState.source}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, source: e.target.value as DataSourceOrigin }))
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Sharpify">Sharpify</option>
                    <option value="Shadow Keys">Shadow Keys</option>
                    <option value="CRM externo">CRM externo</option>
                    <option value="Discord">Discord</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Status</label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, status: e.target.value as Customer['status'] }))
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="VIP">VIP</option>
                    <option value="Em risco">Em risco</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Etiquetas (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formState.tagsText}
                  onChange={(e) => setFormState((s) => ({ ...s, tagsText: e.target.value }))}
                  placeholder="Ex: Recorrente, Keys Steam"
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                />
              </div>

              {formError && <p className="text-xs text-[#F06464]">{formError}</p>}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <SecondaryButton onClick={() => setModalOpen(false)}>Cancelar</SecondaryButton>
                <PrimaryButton type="submit">
                  {editingCustomer ? 'Salvar alterações' : 'Criar cliente'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
