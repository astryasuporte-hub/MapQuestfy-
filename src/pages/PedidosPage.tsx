import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Package,
  Plus,
  ShoppingCart,
  X,
  XCircle,
} from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { Order, OrderDeliveryStatus, OrderPaymentStatus } from '@/src/types/crm';
import { manualOrderSchema } from '@/src/schemas/validation';
import { getOrderCapabilitiesBySource } from '@/src/services/adapters';
import { formatBRL, formatDateTimeBR } from '@/src/services/formatters';
import { DataTable, DataTableColumn } from '@/src/components/ui/DataTable';
import {
  BackendHonestNotice,
  EmptyState,
  PageHeader,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  StatusBadge,
} from '@/src/components/ui/Primitives';

export function PedidosPage() {
  const { orders, customers, addManualOrder, updateOrderStatus } = useCRM();
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('todas');
  const [paymentFilter, setPaymentFilter] = useState('todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [formState, setFormState] = useState({
    customerId: customers[0]?.id || '',
    productName: '',
    category: 'Key de Jogo' as Order['items'][number]['category'],
    quantity: 1,
    unitPrice: 49.9,
    paymentMethod: 'Pix Manual',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const mSource = sourceFilter === 'todas' || o.source === sourceFilter;
      const mPay = paymentFilter === 'todos' || o.paymentStatus === paymentFilter;
      const mQuery =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q));
      return mSource && mPay && mQuery;
    });
  }, [orders, query, sourceFilter, paymentFilter]);

  const metrics = useMemo(() => {
    const approved = orders.filter((o) => o.paymentStatus === 'Aprovado');
    const revenue = approved.reduce((acc, o) => acc + o.total, 0);
    const pending = orders.filter((o) => o.paymentStatus === 'Pendente').length;
    const canceled = orders.filter(
      (o) => o.paymentStatus === 'Cancelado' || o.paymentStatus === 'Reembolsado'
    ).length;
    const pendingDelivery = orders.filter(
      (o) => o.deliveryStatus === 'Aguardando envio' || o.deliveryStatus === 'Em processamento'
    ).length;
    return {
      revenue,
      approvedCount: approved.length,
      pendingCount: pending,
      canceledCount: canceled,
      pendingDelivery,
    };
  }, [orders]);

  const paymentTone = (s: OrderPaymentStatus) => {
    if (s === 'Aprovado') return 'success';
    if (s === 'Pendente') return 'warning';
    return 'error';
  };

  const deliveryTone = (s: OrderDeliveryStatus) => {
    if (s === 'Entregue') return 'success';
    if (s === 'Aguardando envio' || s === 'Em processamento') return 'warning';
    return 'error';
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = manualOrderSchema.safeParse({
      ...formState,
      quantity: Number(formState.quantity),
      unitPrice: Number(formState.unitPrice),
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || 'Dados inválidos.');
      return;
    }
    const cust = customers.find((c) => c.id === parsed.data.customerId);
    if (!cust) {
      setFormError('Selecione um cliente válido.');
      return;
    }
    const total = parsed.data.quantity * parsed.data.unitPrice;
    addManualOrder({
      source: 'Manual',
      customerId: cust.id,
      customerName: cust.name,
      customerDiscord: cust.discordHandle,
      total,
      paymentStatus: 'Aprovado',
      deliveryStatus: 'Entregue',
      paymentMethod: parsed.data.paymentMethod,
      items: [
        {
          id: `itm-${Date.now()}`,
          productName: parsed.data.productName,
          sku: `MAN-${Date.now().toString().slice(-5)}`,
          category: parsed.data.category,
          quantity: parsed.data.quantity,
          unitPrice: parsed.data.unitPrice,
        },
      ],
    });
    setCreateOpen(false);
    setFormState((s) => ({ ...s, productName: '' }));
  };

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Pedido',
      sortable: true,
      sortValue: (o) => o.orderNumber,
      render: (o) => (
        <div>
          <div className="font-mono text-xs font-semibold text-[#A3FF12]">{o.orderNumber}</div>
          <div className="text-[11px] font-mono text-[#9DA89F]">{o.externalId}</div>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Cliente',
      sortable: true,
      sortValue: (o) => o.customerName,
      render: (o) => (
        <div>
          <div className="font-medium text-[#F5F7F5]">{o.customerName}</div>
          {o.customerDiscord && (
            <div className="text-xs text-[#9DA89F]">{o.customerDiscord}</div>
          )}
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Produto',
      render: (o) => (
        <div className="max-w-[260px]">
          <div className="text-xs text-[#F5F7F5] truncate">{o.items[0]?.productName}</div>
          {o.items.length > 1 && (
            <div className="text-[11px] text-[#9DA89F]">+{o.items.length - 1} item(ns)</div>
          )}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Valor',
      align: 'right',
      sortable: true,
      sortValue: (o) => o.total,
      render: (o) => (
        <span className="font-mono font-semibold text-[#F5F7F5] tabular-nums">
          {formatBRL(o.total)}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Origem',
      render: (o) => <StatusBadge label={o.source} tone="neutral" />,
    },
    {
      key: 'payment',
      header: 'Pagamento',
      render: (o) => <StatusBadge label={o.paymentStatus} tone={paymentTone(o.paymentStatus)} />,
    },
    {
      key: 'delivery',
      header: 'Entrega',
      render: (o) => <StatusBadge label={o.deliveryStatus} tone={deliveryTone(o.deliveryStatus)} />,
    },
    {
      key: 'date',
      header: 'Data',
      sortable: true,
      sortValue: (o) => o.createdAt,
      render: (o) => (
        <span className="text-xs text-[#9DA89F] tabular-nums whitespace-nowrap">
          {formatDateTimeBR(o.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (o) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(o);
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#9DA89F] hover:text-[#A3FF12] hover:bg-[#171D18] cursor-pointer"
          aria-label={`Detalhes do pedido ${o.orderNumber}`}
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const activeCapabilities = selectedOrder
    ? getOrderCapabilitiesBySource(selectedOrder.source)
    : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pedidos e Vendas"
        subtitle="Consolidação multicanal com verificação de capacidades por origem"
        actions={
          <PrimaryButton onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Registrar pedido manual
          </PrimaryButton>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4">
          <div className="text-xs text-[#9DA89F]">Receita aprovada (demo)</div>
          <div className="text-xl font-display font-bold text-[#A3FF12] tabular-nums mt-1">
            {formatBRL(metrics.revenue)}
          </div>
        </div>
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4">
          <div className="text-xs text-[#9DA89F] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#36D475]" />
            Aprovados
          </div>
          <div className="text-xl font-display font-bold text-[#F5F7F5] tabular-nums mt-1">
            {metrics.approvedCount}
          </div>
        </div>
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4">
          <div className="text-xs text-[#9DA89F] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#F2B84B]" />
            Pendentes
          </div>
          <div className="text-xl font-display font-bold text-[#F5F7F5] tabular-nums mt-1">
            {metrics.pendingCount}
          </div>
        </div>
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4">
          <div className="text-xs text-[#9DA89F] flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-[#F06464]" />
            Cancelados / Estorno
          </div>
          <div className="text-xl font-display font-bold text-[#F5F7F5] tabular-nums mt-1">
            {metrics.canceledCount}
          </div>
        </div>
        <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 col-span-2 sm:col-span-1">
          <div className="text-xs text-[#9DA89F] flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#72A8FF]" />
            Entregas pendentes
          </div>
          <div className="text-xl font-display font-bold text-[#F5F7F5] tabular-nums mt-1">
            {metrics.pendingDelivery}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por número, cliente ou produto..."
          className="w-full md:w-80"
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
          >
            <option value="todas">Todas as origens</option>
            <option value="Sharpify">Sharpify</option>
            <option value="Shadow Keys">Shadow Keys</option>
            <option value="CRM externo">CRM externo</option>
            <option value="Manual">Manual</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
          >
            <option value="todos">Todos os pagamentos</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Pendente">Pendente</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Reembolsado">Reembolsado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#111713] border border-[#29332C] p-4 sm:p-5">
        <DataTable
          data={filteredOrders}
          columns={columns}
          onRowClick={(o) => setSelectedOrder(o)}
          emptyFallback={
            <EmptyState
              icon={<ShoppingCart className="w-5 h-5" />}
              title="Nenhum pedido encontrado"
              description="Nenhum pedido corresponde aos filtros selecionados."
            />
          }
          renderMobileCard={(o) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#A3FF12]">{o.orderNumber}</span>
                <StatusBadge label={o.source} tone="neutral" />
              </div>
              <div className="text-sm font-medium text-[#F5F7F5]">{o.customerName}</div>
              <div className="text-xs text-[#9DA89F] truncate">{o.items[0]?.productName}</div>
              <div className="flex items-center justify-between pt-2 border-t border-[#29332C]/60">
                <StatusBadge label={o.paymentStatus} tone={paymentTone(o.paymentStatus)} />
                <span className="font-mono text-sm font-semibold text-[#F5F7F5] tabular-nums">
                  {formatBRL(o.total)}
                </span>
              </div>
            </div>
          )}
        />
      </div>

      {/* Order Details Drawer */}
      {selectedOrder && activeCapabilities && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#111713] border-l border-[#29332C] h-full overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#A3FF12]">
                    {selectedOrder.orderNumber}
                  </span>
                  <StatusBadge label={selectedOrder.source} tone="neutral" />
                </div>
                <h2 className="text-lg font-display font-bold text-[#F5F7F5] mt-1">
                  Detalhes do Pedido
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-[#9DA89F] hover:text-[#F5F7F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] p-4 text-xs">
              <div>
                <span className="text-[#9DA89F]">Cliente:</span>
                <div className="text-[#F5F7F5] font-medium mt-0.5">{selectedOrder.customerName}</div>
              </div>
              <div>
                <span className="text-[#9DA89F]">ID Externo:</span>
                <div className="font-mono text-[#F5F7F5] mt-0.5">{selectedOrder.externalId}</div>
              </div>
              <div>
                <span className="text-[#9DA89F]">Pagamento:</span>
                <div className="mt-1">
                  <StatusBadge
                    label={selectedOrder.paymentStatus}
                    tone={paymentTone(selectedOrder.paymentStatus)}
                  />
                </div>
              </div>
              <div>
                <span className="text-[#9DA89F]">Entrega:</span>
                <div className="mt-1">
                  <StatusBadge
                    label={selectedOrder.deliveryStatus}
                    tone={deliveryTone(selectedOrder.deliveryStatus)}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-xs font-semibold text-[#9DA89F] mb-2">Itens do pedido</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-medium text-[#F5F7F5]">{item.productName}</div>
                      <div className="text-[#9DA89F] mt-0.5">
                        SKU {item.sku} · {item.category} · Qtd: {item.quantity}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-[#F5F7F5] tabular-nums">
                      {formatBRL(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 px-1 text-sm font-semibold">
                <span className="text-[#9DA89F]">Total ({selectedOrder.paymentMethod})</span>
                <span className="font-mono text-[#A3FF12] tabular-nums">
                  {formatBRL(selectedOrder.total)}
                </span>
              </div>
            </div>

            {/* Adapter Capability Check */}
            <div className="rounded-xl bg-[#0B0F0C] border border-[#29332C] p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F7F5]">
                <Info className="w-4 h-4 text-[#72A8FF]" />
                Capacidades da integração ({selectedOrder.source})
              </div>
              {!activeCapabilities.isDocumented || !activeCapabilities.canEditOrder ? (
                <BackendHonestNotice
                  message={
                    activeCapabilities.unavailableReason ||
                    'Edição direta de pedidos externos desabilitada para preservar integridade da plataforma de origem.'
                  }
                />
              ) : null}

              {selectedOrder.source === 'Manual' && (
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, {
                        paymentStatus: 'Aprovado',
                        deliveryStatus: 'Entregue',
                      });
                      setSelectedOrder((prev) =>
                        prev ? { ...prev, paymentStatus: 'Aprovado', deliveryStatus: 'Entregue' } : null
                      );
                    }}
                    className="text-xs"
                  >
                    Marcar aprovado e entregue
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, { paymentStatus: 'Cancelado' });
                      setSelectedOrder((prev) =>
                        prev ? { ...prev, paymentStatus: 'Cancelado' } : null
                      );
                    }}
                    className="text-xs text-[#F06464]"
                  >
                    Cancelar pedido manual
                  </SecondaryButton>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-xs font-semibold text-[#9DA89F] mb-2">Histórico de eventos</h3>
              <div className="space-y-2.5">
                {selectedOrder.timeline.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start justify-between gap-3 text-xs border-b border-[#29332C]/60 pb-2"
                  >
                    <span className="text-[#F5F7F5]">{ev.label}</span>
                    <span className="text-[#9DA89F] tabular-nums shrink-0">
                      {formatDateTimeBR(ev.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Manual Order Modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#111713] border border-[#29332C] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-[#F5F7F5]">
                Novo pedido manual (Demo)
              </h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1.5 rounded-lg text-[#9DA89F] hover:text-[#F5F7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="space-y-3.5">
              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Cliente</label>
                <select
                  value={formState.customerId}
                  onChange={(e) => setFormState((s) => ({ ...s, customerId: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.discordHandle || c.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Produto digital</label>
                <input
                  type="text"
                  required
                  value={formState.productName}
                  onChange={(e) => setFormState((s) => ({ ...s, productName: e.target.value }))}
                  placeholder="Ex: Key Steam Helldivers 2"
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Categoria</label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        category: e.target.value as Order['items'][number]['category'],
                      }))
                    }
                    className="w-full h-10 px-2 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                  >
                    <option value="Key de Jogo">Key de Jogo</option>
                    <option value="Assinatura">Assinatura</option>
                    <option value="Software">Software</option>
                    <option value="Gift Card">Gift Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Qtd.</label>
                  <input
                    type="number"
                    min={1}
                    value={formState.quantity}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, quantity: Number(e.target.value) }))
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm font-mono text-[#F5F7F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#9DA89F] mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={1}
                    value={formState.unitPrice}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, unitPrice: Number(e.target.value) }))
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm font-mono text-[#F5F7F5]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#9DA89F] mb-1">Meio de pagamento</label>
                <input
                  type="text"
                  value={formState.paymentMethod}
                  onChange={(e) => setFormState((s) => ({ ...s, paymentMethod: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5]"
                />
              </div>
              {formError && <p className="text-xs text-[#F06464]">{formError}</p>}
              <div className="flex justify-end gap-2.5 pt-2">
                <SecondaryButton onClick={() => setCreateOpen(false)}>Cancelar</SecondaryButton>
                <PrimaryButton type="submit">Registrar pedido</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
