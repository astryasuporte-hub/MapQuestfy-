import { IntegrationItem, Order } from '@/src/types/crm';

export interface IntegrationCapabilities {
  canReadOrders: boolean;
  canCreateOrder: boolean;
  canEditOrder: boolean;
  canCancelOrder: boolean;
  canSyncCustomers: boolean;
  canManageRoles: boolean;
  canSendMessages: boolean;
  isDocumented: boolean;
  unavailableReason?: string;
}

export interface IntegrationAdapterContract {
  id: IntegrationItem['id'];
  displayName: string;
  capabilities: IntegrationCapabilities;
  getStatusSummary: (item: IntegrationItem) => string;
  testConnectionDemo: (item: IntegrationItem) => Promise<{ ok: boolean; message: string }>;
}

export const DiscordAdapter: IntegrationAdapterContract = {
  id: 'discord',
  displayName: 'Discord Bot & Gateway',
  capabilities: {
    canReadOrders: false,
    canCreateOrder: false,
    canEditOrder: false,
    canCancelOrder: false,
    canSyncCustomers: true,
    canManageRoles: true,
    canSendMessages: true,
    isDocumented: true,
    unavailableReason: 'O processo permanente do bot Discord opera em serviço separado no backend.',
  },
  getStatusSummary: (item) =>
    item.status === 'Conectado'
      ? 'Gateway sincronizado'
      : 'Aguardando conexão com o serviço do bot',
  testConnectionDemo: async () => ({
    ok: false,
    message: 'Esta ação estará disponível após conectar o serviço permanente do bot Discord no backend.',
  }),
};

export const SharpifyAdapter: IntegrationAdapterContract = {
  id: 'sharpify',
  displayName: 'Sharpify E-commerce',
  capabilities: {
    canReadOrders: true,
    canCreateOrder: false,
    canEditOrder: false,
    canCancelOrder: true,
    canSyncCustomers: true,
    canManageRoles: false,
    canSendMessages: false,
    isDocumented: true,
    unavailableReason: 'Webhooks e API Sharpify exigem proxy autenticado no servidor.',
  },
  getStatusSummary: (item) =>
    item.lastSyncAt
      ? 'Catálogo e webhooks preparados para sincronização'
      : 'Configuração inicial pronta para webhooks',
  testConnectionDemo: async () => ({
    ok: false,
    message: 'Esta ação estará disponível após configurar os segredos da Sharpify no backend.',
  }),
};

export const ShadowKeysAdapter: IntegrationAdapterContract = {
  id: 'shadow_keys',
  displayName: 'Shadow Keys',
  capabilities: {
    canReadOrders: true,
    canCreateOrder: false,
    canEditOrder: false,
    canCancelOrder: false,
    canSyncCustomers: false,
    canManageRoles: false,
    canSendMessages: false,
    isDocumented: false,
    unavailableReason:
      'Integração aguardando documentação oficial e definição de endpoints da Shadow Keys.',
  },
  getStatusSummary: () => 'Aguardando documentação oficial da plataforma',
  testConnectionDemo: async () => ({
    ok: false,
    message: 'Shadow Keys ainda está aguardando documentação para habilitar testes de conexão.',
  }),
};

export const ExternalCRMAdapter: IntegrationAdapterContract = {
  id: 'external_crm',
  displayName: 'CRM Externo',
  capabilities: {
    canReadOrders: true,
    canCreateOrder: false,
    canEditOrder: false,
    canCancelOrder: false,
    canSyncCustomers: true,
    canManageRoles: false,
    canSendMessages: false,
    isDocumented: false,
    unavailableReason:
      'Contrato extensível pronto. Aguardando documentação e mapeamento oficial do CRM externo.',
  },
  getStatusSummary: () => 'Aguardando documentação e schema de campos do CRM externo',
  testConnectionDemo: async () => ({
    ok: false,
    message: 'CRM externo aguardando documentação técnica para ativar sincronização real.',
  }),
};

export const ADAPTER_REGISTRY: Record<IntegrationItem['id'], IntegrationAdapterContract> = {
  discord: DiscordAdapter,
  sharpify: SharpifyAdapter,
  shadow_keys: ShadowKeysAdapter,
  external_crm: ExternalCRMAdapter,
};

export function getOrderCapabilitiesBySource(source: Order['source']): IntegrationCapabilities {
  if (source === 'Manual') {
    return {
      canReadOrders: true,
      canCreateOrder: true,
      canEditOrder: true,
      canCancelOrder: true,
      canSyncCustomers: true,
      canManageRoles: false,
      canSendMessages: false,
      isDocumented: true,
    };
  }
  if (source === 'Sharpify') return SharpifyAdapter.capabilities;
  if (source === 'Shadow Keys') return ShadowKeysAdapter.capabilities;
  return ExternalCRMAdapter.capabilities;
}
