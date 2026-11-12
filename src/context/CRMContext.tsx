import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityEvent,
  AdminUser,
  AppRoute,
  AppSettings,
  AuditLog,
  Automation,
  AutomationExecution,
  AutoRoleRule,
  BotCommand,
  BotConfiguration,
  Conversation,
  Customer,
  DiscordChannel,
  DiscordGuild,
  DiscordMember,
  DiscordRole,
  EmbedTemplate,
  IntegrationItem,
  ModerationCase,
  ModerationSettings,
  NotificationItem,
  Order,
  Role,
  SyncJob,
  Ticket,
  TicketConfig,
  User,
} from '@/src/types/crm';
import {
  DEMO_CURRENT_USER,
  INITIAL_ACTIVITIES,
  INITIAL_ADMINS,
  INITIAL_AUDIT_LOGS,
  INITIAL_AUTOMATION_EXECUTIONS,
  INITIAL_AUTOMATIONS,
  INITIAL_AUTOROLE_RULES,
  INITIAL_BOT_COMMANDS,
  INITIAL_BOT_CONFIG,
  INITIAL_CHANNELS,
  INITIAL_CONVERSATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_EMBED_TEMPLATES,
  INITIAL_GUILDS,
  INITIAL_INTEGRATIONS,
  INITIAL_MEMBERS,
  INITIAL_MODERATION_CASES,
  INITIAL_MODERATION_SETTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_ROLE_MATRICES,
  INITIAL_ROLES,
  INITIAL_SETTINGS,
  INITIAL_SYNC_JOBS,
  INITIAL_TICKET_CONFIG,
  INITIAL_TICKETS,
} from '@/src/data/seedData';

const STORAGE_KEY = 'mapquestfy_crm_demo_v1';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired' | 'denied';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

interface PersistedDemoState {
  authStatus: AuthStatus;
  currentRoute: AppRoute;
  selectedGuildId: string;
  currentUser: User;
  admins: AdminUser[];
  roleMatrices: Role[];
  customers: Customer[];
  orders: Order[];
  tickets: Ticket[];
  ticketConfig: TicketConfig;
  conversations: Conversation[];
  botConfig: BotConfiguration;
  commands: BotCommand[];
  members: DiscordMember[];
  roles: DiscordRole[];
  channels: DiscordChannel[];
  autoRoleRules: AutoRoleRule[];
  moderationCases: ModerationCase[];
  moderationSettings: ModerationSettings;
  embedTemplates: EmbedTemplate[];
  automations: Automation[];
  automationExecutions: AutomationExecution[];
  integrations: IntegrationItem[];
  syncJobs: SyncJob[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  activities: ActivityEvent[];
  settings: AppSettings;
}

function getInitialState(): PersistedDemoState {
  const defaultState: PersistedDemoState = {
    authStatus: 'authenticated',
    currentRoute: '/',
    selectedGuildId: INITIAL_GUILDS[0].id,
    currentUser: DEMO_CURRENT_USER,
    admins: INITIAL_ADMINS,
    roleMatrices: INITIAL_ROLE_MATRICES,
    customers: INITIAL_CUSTOMERS,
    orders: INITIAL_ORDERS,
    tickets: INITIAL_TICKETS,
    ticketConfig: INITIAL_TICKET_CONFIG,
    conversations: INITIAL_CONVERSATIONS,
    botConfig: INITIAL_BOT_CONFIG,
    commands: INITIAL_BOT_COMMANDS,
    members: INITIAL_MEMBERS,
    roles: INITIAL_ROLES,
    channels: INITIAL_CHANNELS,
    autoRoleRules: INITIAL_AUTOROLE_RULES,
    moderationCases: INITIAL_MODERATION_CASES,
    moderationSettings: INITIAL_MODERATION_SETTINGS,
    embedTemplates: INITIAL_EMBED_TEMPLATES,
    automations: INITIAL_AUTOMATIONS,
    automationExecutions: INITIAL_AUTOMATION_EXECUTIONS,
    integrations: INITIAL_INTEGRATIONS,
    syncJobs: INITIAL_SYNC_JOBS,
    auditLogs: INITIAL_AUDIT_LOGS,
    notifications: INITIAL_NOTIFICATIONS,
    activities: INITIAL_ACTIVITIES,
    settings: INITIAL_SETTINGS,
  };

  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<PersistedDemoState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

interface CRMContextValue extends PersistedDemoState {
  guilds: DiscordGuild[];
  selectedGuild: DiscordGuild;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  navigate: (route: AppRoute) => void;
  setSelectedGuildId: (guildId: string) => void;
  loginDemo: () => void;
  logoutDemo: () => void;
  simulateAuthState: (status: AuthStatus) => void;
  switchDemoProfile: (profile: User['profile']) => void;
  resetDemoData: () => void;
  recordAudit: (entry: Omit<AuditLog, 'id' | 'timestamp' | 'actorName' | 'actorDiscordId'>) => void;
  addActivity: (event: Omit<ActivityEvent, 'id' | 'createdAt' | 'timestampLabel'>) => void;
  toggleQuickBotSetting: (key: keyof BotConfiguration['quickToggles']) => void;
  addAdminUser: (admin: Omit<AdminUser, 'id' | 'addedAt' | 'addedBy' | 'authLinked' | 'active' | 'moduleOverrides'>) => void;
  updateAdminUser: (id: string, patch: Partial<AdminUser>) => void;
  revokeAdminUser: (id: string) => void;
  updateRoleMatrix: (profile: Role['profile'], permissions: Role['permissions']) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'ordersCount' | 'totalSpent' | 'firstContactAt' | 'lastInteractionAt' | 'notes' | 'externalReferences'>) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  addCustomerNote: (customerId: string, content: string) => void;
  addManualOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'externalId' | 'createdAt' | 'updatedAt' | 'timeline'>) => void;
  updateOrderStatus: (orderId: string, patch: Partial<Pick<Order, 'paymentStatus' | 'deliveryStatus'>>) => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'code' | 'channelName' | 'createdAt' | 'updatedAt'>) => Ticket;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  addTicketMessage: (ticketId: string, content: string, isInternalNote: boolean) => void;
  updateTicketConfig: (patch: Partial<TicketConfig>) => void;
  addConversationMessage: (convId: string, content: string, isInternal: boolean) => void;
  updateConversation: (convId: string, patch: Partial<Conversation>) => void;
  createConversation: (customerId: string, channel: Conversation['channel'], initialText: string) => void;
  toggleBotFeature: (featureId: string) => void;
  updateBotFeature: (featureId: string, patch: Partial<BotConfiguration['features'][number]>) => void;
  updateMemberRoles: (memberId: string, roleIds: string[]) => void;
  addAutoRoleRule: (rule: Omit<AutoRoleRule, 'id'>) => void;
  toggleAutoRoleRule: (id: string) => void;
  deleteAutoRoleRule: (id: string) => void;
  addModerationCase: (item: Omit<ModerationCase, 'id' | 'createdAt' | 'moderatorName'>) => void;
  updateModerationSettings: (patch: Partial<ModerationSettings>) => void;
  updateCommand: (id: string, patch: Partial<BotCommand>) => void;
  saveEmbedTemplate: (template: EmbedTemplate) => void;
  deleteEmbedTemplate: (id: string) => void;
  saveAutomation: (automation: Automation) => void;
  toggleAutomation: (id: string) => void;
  runAutomationTest: (id: string) => void;
  deleteAutomation: (id: string) => void;
  updateIntegration: (id: IntegrationItem['id'], patch: Partial<IntegrationItem>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const CRMContext = createContext<CRMContextValue | null>(null);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedDemoState>(getInitialState);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [state]);

  // Sync browser URL path cleanly without external router dependency
  useEffect(() => {
    const path = window.location.pathname as AppRoute;
    const validRoutes: AppRoute[] = [
      '/', '/clientes', '/pedidos', '/atendimento', '/tickets',
      '/bot', '/membros', '/cargos', '/moderacao', '/comandos',
      '/mensagens', '/automacoes', '/permissoes', '/integracoes',
      '/relatorios', '/auditoria', '/configuracoes', '/login',
    ];
    if (validRoutes.includes(path) && path !== state.currentRoute) {
      setState((prev) => ({ ...prev, currentRoute: path }));
    }
    const onPopState = () => {
      const next = window.location.pathname as AppRoute;
      if (validRoutes.includes(next)) {
        setState((prev) => ({ ...prev, currentRoute: next }));
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const navigate = useCallback((route: AppRoute) => {
    setSelectedCustomerId(null);
    setState((prev) => ({ ...prev, currentRoute: route }));
    if (window.location.pathname !== route) {
      window.history.pushState({}, '', route);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const setSelectedGuildId = useCallback((guildId: string) => {
    setState((prev) => ({ ...prev, selectedGuildId: guildId }));
    pushToast({ type: 'info', title: 'Servidor alterado (Modo Demonstração)' });
  }, [pushToast]);

  const recordAudit = useCallback(
    (entry: Omit<AuditLog, 'id' | 'timestamp' | 'actorName' | 'actorDiscordId'>) => {
      setState((prev) => ({
        ...prev,
        auditLogs: [
          {
            ...entry,
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorName: prev.currentUser.name,
            actorDiscordId: prev.currentUser.discordId,
          },
          ...prev.auditLogs,
        ],
      }));
    },
    []
  );

  const addActivity = useCallback(
    (event: Omit<ActivityEvent, 'id' | 'createdAt' | 'timestampLabel'>) => {
      setState((prev) => ({
        ...prev,
        activities: [
          {
            ...event,
            id: `act-${Date.now()}`,
            createdAt: new Date().toISOString(),
            timestampLabel: 'agora mesmo',
          },
          ...prev.activities,
        ],
      }));
    },
    []
  );

  const loginDemo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      authStatus: 'authenticated',
      currentRoute: '/',
    }));
    window.history.pushState({}, '', '/');
    pushToast({ type: 'success', title: 'Sessão demonstrativa iniciada', description: 'Conectado como Ref (Administrador).' });
  }, [pushToast]);

  const logoutDemo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      authStatus: 'unauthenticated',
      currentRoute: '/login',
    }));
    window.history.pushState({}, '', '/login');
  }, []);

  const simulateAuthState = useCallback((status: AuthStatus) => {
    setState((prev) => ({
      ...prev,
      authStatus: status,
      currentRoute: status === 'authenticated' ? '/' : '/login',
    }));
  }, []);

  const switchDemoProfile = useCallback((profile: User['profile']) => {
    setState((prev) => ({
      ...prev,
      currentUser: { ...prev.currentUser, profile },
    }));
    pushToast({ type: 'info', title: `Perfil demonstrativo: ${profile}` });
  }, [pushToast]);

  const resetDemoData = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(getInitialState());
    setSelectedCustomerId(null);
    pushToast({ type: 'success', title: 'Dados de demonstração restaurados' });
  }, [pushToast]);

  const toggleQuickBotSetting = useCallback(
    (key: keyof BotConfiguration['quickToggles']) => {
      setState((prev) => {
        const nextVal = !prev.botConfig.quickToggles[key];
        const labelMap: Record<keyof BotConfiguration['quickToggles'], string> = {
          autoRole: 'Cargo automático',
          welcomeMessage: 'Mensagem de boas-vindas',
          antiSpam: 'Proteção antispam',
          ticketOpening: 'Abertura de tickets',
          adminLogs: 'Logs administrativos',
        };
        const auditItem: AuditLog = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorName: prev.currentUser.name,
          actorDiscordId: prev.currentUser.discordId,
          action: 'Configuração atualizada',
          module: 'Bot Discord',
          resource: labelMap[key],
          result: 'Sucesso',
          source: 'Modo Demonstração',
          details: `${labelMap[key]} alterado para ${nextVal ? 'Ativado' : 'Desativado'} no painel rápido.`,
        };
        return {
          ...prev,
          botConfig: {
            ...prev.botConfig,
            quickToggles: {
              ...prev.botConfig.quickToggles,
              [key]: nextVal,
            },
          },
          auditLogs: [auditItem, ...prev.auditLogs],
        };
      });
    },
    []
  );

  const addAdminUser = useCallback(
    (admin: Omit<AdminUser, 'id' | 'addedAt' | 'addedBy' | 'authLinked' | 'active' | 'moduleOverrides'>) => {
      setState((prev) => {
        if (prev.admins.some((a) => a.discordId === admin.discordId)) {
          return prev;
        }
        const newAdmin: AdminUser = {
          ...admin,
          id: `adm-${Date.now()}`,
          addedBy: prev.currentUser.name,
          addedAt: new Date().toISOString(),
          authLinked: false,
          active: true,
          moduleOverrides: {},
        };
        const auditItem: AuditLog = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorName: prev.currentUser.name,
          actorDiscordId: prev.currentUser.discordId,
          action: 'Administrador autorizado (Demo)',
          module: 'Permissões',
          resource: `${admin.displayName} (${admin.discordId})`,
          result: 'Sucesso',
          source: 'Modo Demonstração',
          details: `Perfil inicial ${admin.profile} atribuído. Validação real será exigida no backend.`,
        };
        return {
          ...prev,
          admins: [newAdmin, ...prev.admins],
          auditLogs: [auditItem, ...prev.auditLogs],
        };
      });
      pushToast({ type: 'success', title: 'Discord ID autorizado no modo demonstração' });
    },
    [pushToast]
  );

  const updateAdminUser = useCallback(
    (id: string, patch: Partial<AdminUser>) => {
      setState((prev) => {
        const target = prev.admins.find((a) => a.id === id);
        if (!target) return prev;
        // Segurança: não permitir que o usuário eleve os próprios privilégios
        if (target.discordId === prev.currentUser.discordId && patch.profile && patch.profile !== target.profile) {
          return prev;
        }
        const updated = prev.admins.map((a) => (a.id === id ? { ...a, ...patch } : a));
        const auditItem: AuditLog = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorName: prev.currentUser.name,
          actorDiscordId: prev.currentUser.discordId,
          action: 'Permissão alterada',
          module: 'Permissões',
          resource: `${target.displayName} (${target.discordId})`,
          result: 'Sucesso',
          source: 'Modo Demonstração',
          details: 'Perfil ou overrides de módulo atualizados localmente.',
        };
        return { ...prev, admins: updated, auditLogs: [auditItem, ...prev.auditLogs] };
      });
    },
    []
  );

  const revokeAdminUser = useCallback(
    (id: string) => {
      setState((prev) => {
        const target = prev.admins.find((a) => a.id === id);
        if (!target) return prev;
        if (target.discordId === prev.currentUser.discordId) return prev;
        const auditItem: AuditLog = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorName: prev.currentUser.name,
          actorDiscordId: prev.currentUser.discordId,
          action: 'Acesso administrativo revogado',
          module: 'Permissões',
          resource: `${target.displayName} (${target.discordId})`,
          result: 'Sucesso',
          source: 'Modo Demonstração',
          details: 'Acesso revogado na lista demonstrativa.',
        };
        return {
          ...prev,
          admins: prev.admins.filter((a) => a.id !== id),
          auditLogs: [auditItem, ...prev.auditLogs],
        };
      });
      pushToast({ type: 'info', title: 'Acesso administrativo revogado' });
    },
    [pushToast]
  );

  const updateRoleMatrix = useCallback((profile: Role['profile'], permissions: Role['permissions']) => {
    setState((prev) => ({
      ...prev,
      roleMatrices: prev.roleMatrices.map((r) => (r.profile === profile ? { ...r, permissions } : r)),
    }));
  }, []);

  const addCustomer = useCallback(
    (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'ordersCount' | 'totalSpent' | 'firstContactAt' | 'lastInteractionAt' | 'notes' | 'externalReferences'>): Customer => {
      const now = new Date().toISOString();
      const newCustomer: Customer = {
        ...data,
        id: `cust-${Date.now()}`,
        externalReferences: [
          {
            source: data.source,
            externalId: `demo_${Date.now().toString().slice(-6)}`,
            label: `Cadastro ${data.source}`,
            syncedAt: now,
          },
        ],
        ordersCount: 0,
        totalSpent: 0,
        firstContactAt: now,
        lastInteractionAt: now,
        notes: [],
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({
        ...prev,
        customers: [newCustomer, ...prev.customers],
        auditLogs: [
          {
            id: `aud-${Date.now()}`,
            timestamp: now,
            actorName: prev.currentUser.name,
            actorDiscordId: prev.currentUser.discordId,
            action: 'Cliente cadastrado',
            module: 'Clientes',
            resource: newCustomer.name,
            result: 'Sucesso',
            source: 'Modo Demonstração',
            details: `Origem: ${newCustomer.source}.`,
          },
          ...prev.auditLogs,
        ],
      }));
      pushToast({ type: 'success', title: 'Cliente adicionado ao CRM' });
      return newCustomer;
    },
    [pushToast]
  );

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c)),
    }));
    pushToast({ type: 'success', title: 'Ficha do cliente atualizada' });
  }, [pushToast]);

  const addCustomerNote = useCallback((customerId: string, content: string) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              updatedAt: now,
              notes: [{ id: `note-${Date.now()}`, authorName: prev.currentUser.name, content, createdAt: now }, ...c.notes],
            }
          : c
      ),
    }));
    pushToast({ type: 'success', title: 'Nota interna registrada' });
  }, [pushToast]);

  const addManualOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'orderNumber' | 'externalId' | 'createdAt' | 'updatedAt' | 'timeline'>) => {
      const now = new Date().toISOString();
      const num = Math.floor(1005 + Math.random() * 8900);
      const newOrder: Order = {
        ...orderData,
        id: `ord-${Date.now()}`,
        orderNumber: `#MAN-${num}`,
        externalId: `man_ord_${num}`,
        timeline: [{ id: `tl-${Date.now()}`, label: 'Pedido manual registrado no painel', timestamp: now }],
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({
        ...prev,
        orders: [newOrder, ...prev.orders],
        customers: prev.customers.map((c) =>
          c.id === orderData.customerId
            ? {
                ...c,
                ordersCount: c.ordersCount + 1,
                totalSpent: c.totalSpent + orderData.total,
                lastPurchaseAt: now,
              }
            : c
        ),
        activities: [
          {
            id: `act-${Date.now()}`,
            type: 'order_approved',
            title: `Pedido manual ${newOrder.orderNumber} criado`,
            subtitle: `${newOrder.customerName} • R$ ${newOrder.total.toFixed(2).replace('.', ',')}`,
            timestampLabel: 'agora mesmo',
            createdAt: now,
          },
          ...prev.activities,
        ],
      }));
      pushToast({ type: 'success', title: `Pedido ${newOrder.orderNumber} registrado` });
    },
    [pushToast]
  );

  const updateOrderStatus = useCallback((orderId: string, patch: Partial<Pick<Order, 'paymentStatus' | 'deliveryStatus'>>) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              ...patch,
              updatedAt: now,
              timeline: [
                ...o.timeline,
                {
                  id: `tl-${Date.now()}`,
                  label: `Status atualizado (${patch.paymentStatus ?? o.paymentStatus} / ${patch.deliveryStatus ?? o.deliveryStatus})`,
                  timestamp: now,
                },
              ],
            }
          : o
      ),
    }));
    pushToast({ type: 'success', title: 'Pedido atualizado' });
  }, [pushToast]);

  const addTicket = useCallback(
    (data: Omit<Ticket, 'id' | 'code' | 'channelName' | 'createdAt' | 'updatedAt'>): Ticket => {
      const now = new Date().toISOString();
      let createdTicket!: Ticket;
      setState((prev) => {
        const nextNum = 105 + prev.tickets.length;
        const code = `#${nextNum}`;
        const slug = data.customerName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'cliente';
        createdTicket = {
          ...data,
          id: `tkt-${Date.now()}`,
          code,
          channelName: `ticket-0${nextNum}-${slug}`,
          createdAt: now,
          updatedAt: now,
        };
        return {
          ...prev,
          tickets: [createdTicket, ...prev.tickets],
          activities: [
            {
              id: `act-${Date.now()}`,
              type: 'ticket_created',
              title: `Ticket ${code} criado`,
              subtitle: `Cliente: ${data.customerDiscord}`,
              timestampLabel: 'agora mesmo',
              createdAt: now,
            },
            ...prev.activities,
          ],
        };
      });
      pushToast({ type: 'success', title: 'Ticket criado no modo demonstração' });
      return createdTicket;
    },
    [pushToast]
  );

  const updateTicket = useCallback((id: string, patch: Partial<Ticket>) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const target = prev.tickets.find((t) => t.id === id);
      const isClosing = patch.status === 'Resolvido' || patch.status === 'Fechado';
      return {
        ...prev,
        tickets: prev.tickets.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now } : t)),
        auditLogs: target && isClosing
          ? [
              {
                id: `aud-${Date.now()}`,
                timestamp: now,
                actorName: prev.currentUser.name,
                actorDiscordId: prev.currentUser.discordId,
                action: 'Ticket encerrado',
                module: 'Tickets',
                resource: `Ticket ${target.code} (${target.customerDiscord})`,
                result: 'Sucesso',
                source: 'Painel Web',
                details: `Status alterado para ${patch.status}.`,
              },
              ...prev.auditLogs,
            ]
          : prev.auditLogs,
      };
    });
    pushToast({ type: 'success', title: 'Ticket atualizado' });
  }, [pushToast]);

  const addTicketMessage = useCallback((ticketId: string, content: string, isInternalNote: boolean) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              updatedAt: now,
              messages: [
                ...t.messages,
                {
                  id: `tm-${Date.now()}`,
                  authorName: prev.currentUser.name,
                  authorRole: 'equipe',
                  content,
                  isInternalNote,
                  createdAt: now,
                },
              ],
            }
          : t
      ),
    }));
  }, []);

  const updateTicketConfig = useCallback((patch: Partial<TicketConfig>) => {
    setState((prev) => ({ ...prev, ticketConfig: { ...prev.ticketConfig, ...patch } }));
    pushToast({ type: 'success', title: 'Configurações de tickets salvas localmente' });
  }, [pushToast]);

  const addConversationMessage = useCallback((convId: string, content: string, isInternal: boolean) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === convId
          ? {
              ...c,
              unread: false,
              status: isInternal ? c.status : 'Em atendimento',
              updatedAt: now,
              messages: [
                ...c.messages,
                {
                  id: `cm-${Date.now()}`,
                  sender: 'atendente',
                  senderName: prev.currentUser.name,
                  content,
                  isInternal,
                  createdAt: now,
                },
              ],
            }
          : c
      ),
    }));
  }, []);

  const updateConversation = useCallback((convId: string, patch: Partial<Conversation>) => {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) => (c.id === convId ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c)),
    }));
  }, []);

  const createConversation = useCallback((customerId: string, channel: Conversation['channel'], initialText: string) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const cust = prev.customers.find((c) => c.id === customerId);
      if (!cust) return prev;
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        customerId: cust.id,
        customerName: cust.name,
        customerDiscord: cust.discordHandle || cust.email,
        customerAvatar: cust.avatarUrl,
        channel,
        status: 'Em atendimento',
        priority: 'Média',
        assignee: prev.currentUser.name,
        unread: false,
        tags: cust.tags.slice(0, 2),
        messages: [
          {
            id: `cm-${Date.now()}`,
            sender: 'atendente',
            senderName: prev.currentUser.name,
            content: initialText,
            isInternal: false,
            createdAt: now,
          },
        ],
        updatedAt: now,
      };
      return { ...prev, conversations: [newConv, ...prev.conversations] };
    });
    pushToast({ type: 'success', title: 'Conversa criada no modo demonstração' });
  }, [pushToast]);

  const toggleBotFeature = useCallback((featureId: string) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      botConfig: {
        ...prev.botConfig,
        features: prev.botConfig.features.map((f) => (f.id === featureId ? { ...f, enabled: !f.enabled, updatedAt: now } : f)),
      },
    }));
  }, []);

  const updateBotFeature = useCallback((featureId: string, patch: Partial<BotConfiguration['features'][number]>) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      botConfig: {
        ...prev.botConfig,
        features: prev.botConfig.features.map((f) => (f.id === featureId ? { ...f, ...patch, updatedAt: now } : f)),
      },
    }));
    pushToast({ type: 'success', title: 'Recurso do bot atualizado' });
  }, [pushToast]);

  const updateMemberRoles = useCallback((memberId: string, roleIds: string[]) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === memberId ? { ...m, roleIds } : m)),
    }));
    pushToast({ type: 'success', title: 'Cargos do membro atualizados (Demo)' });
  }, [pushToast]);

  const addAutoRoleRule = useCallback((rule: Omit<AutoRoleRule, 'id'>) => {
    setState((prev) => ({
      ...prev,
      autoRoleRules: [{ ...rule, id: `ar-${Date.now()}` }, ...prev.autoRoleRules],
    }));
    pushToast({ type: 'success', title: 'Regra de cargo automático criada' });
  }, [pushToast]);

  const toggleAutoRoleRule = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      autoRoleRules: prev.autoRoleRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    }));
  }, []);

  const deleteAutoRoleRule = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      autoRoleRules: prev.autoRoleRules.filter((r) => r.id !== id),
    }));
    pushToast({ type: 'info', title: 'Regra removida' });
  }, [pushToast]);

  const addModerationCase = useCallback((item: Omit<ModerationCase, 'id' | 'createdAt' | 'moderatorName'>) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      moderationCases: [
        { ...item, id: `mod-${Date.now()}`, moderatorName: prev.currentUser.name, createdAt: now },
        ...prev.moderationCases,
      ],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          actorName: prev.currentUser.name,
          actorDiscordId: prev.currentUser.discordId,
          action: `${item.type} registrada (Demo)`,
          module: 'Moderação',
          resource: `${item.targetHandle} (${item.targetDiscordId})`,
          result: 'Sucesso',
          source: 'Modo Demonstração',
          details: item.reason,
        },
        ...prev.auditLogs,
      ],
    }));
    pushToast({ type: 'warning', title: `${item.type} registrada no histórico de demonstração` });
  }, [pushToast]);

  const updateModerationSettings = useCallback((patch: Partial<ModerationSettings>) => {
    setState((prev) => ({ ...prev, moderationSettings: { ...prev.moderationSettings, ...patch } }));
    pushToast({ type: 'success', title: 'Regras de moderação salvas' });
  }, [pushToast]);

  const updateCommand = useCallback((id: string, patch: Partial<BotCommand>) => {
    setState((prev) => ({
      ...prev,
      commands: prev.commands.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const saveEmbedTemplate = useCallback((template: EmbedTemplate) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const exists = prev.embedTemplates.some((t) => t.id === template.id);
      return {
        ...prev,
        embedTemplates: exists
          ? prev.embedTemplates.map((t) => (t.id === template.id ? { ...template, updatedAt: now } : t))
          : [{ ...template, updatedAt: now }, ...prev.embedTemplates],
      };
    });
    pushToast({ type: 'success', title: 'Modelo de Embed salvo localmente' });
  }, [pushToast]);

  const deleteEmbedTemplate = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      embedTemplates: prev.embedTemplates.filter((t) => t.id !== id),
    }));
    pushToast({ type: 'info', title: 'Modelo excluído' });
  }, [pushToast]);

  const saveAutomation = useCallback((automation: Automation) => {
    setState((prev) => {
      const exists = prev.automations.some((a) => a.id === automation.id);
      return {
        ...prev,
        automations: exists
          ? prev.automations.map((a) => (a.id === automation.id ? automation : a))
          : [automation, ...prev.automations],
      };
    });
    pushToast({ type: 'success', title: 'Fluxo de automação salvo' });
  }, [pushToast]);

  const toggleAutomation = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      automations: prev.automations.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    }));
  }, []);

  const runAutomationTest = useCallback((id: string) => {
    const now = new Date().toISOString();
    setState((prev) => {
      const auto = prev.automations.find((a) => a.id === id);
      if (!auto) return prev;
      const exec: AutomationExecution = {
        id: `exec-${Date.now()}`,
        automationId: auto.id,
        automationName: auto.name,
        status: auto.lastError ? 'Falha' : 'Simulado',
        summary: auto.lastError
          ? `Teste bloqueado: ${auto.lastError}`
          : `Execução simulada com sucesso (${auto.actions.length} ação(ões) validadas).`,
        executedAt: now,
      };
      return {
        ...prev,
        automations: prev.automations.map((a) => (a.id === id ? { ...a, lastRunAt: now, runCount: a.runCount + 1 } : a)),
        automationExecutions: [exec, ...prev.automationExecutions],
      };
    });
    pushToast({ type: 'info', title: 'Teste demonstrativo executado' });
  }, [pushToast]);

  const deleteAutomation = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      automations: prev.automations.filter((a) => a.id !== id),
    }));
    pushToast({ type: 'info', title: 'Automação removida' });
  }, [pushToast]);

  const updateIntegration = useCallback((id: IntegrationItem['id'], patch: Partial<IntegrationItem>) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      integrations: prev.integrations.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now,
          actorName: prev.currentUser.name,
          actorDiscordId: prev.currentUser.discordId,
          action: 'Integração configurada',
          module: 'Integrações',
          resource: id,
          result: 'Sucesso',
          source: 'Painel Web',
          details: 'Parâmetros de mapeamento e sincronização atualizados (sem credenciais).',
        },
        ...prev.auditLogs,
      ],
    }));
    pushToast({ type: 'success', title: 'Configuração da integração salva' });
  }, [pushToast]);

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
    pushToast({ type: 'success', title: 'Preferências atualizadas' });
  }, [pushToast]);

  const selectedGuild = INITIAL_GUILDS.find((g) => g.id === state.selectedGuildId) || INITIAL_GUILDS[0];

  return (
    <CRMContext.Provider
      value={{
        ...state,
        guilds: INITIAL_GUILDS,
        selectedGuild,
        selectedCustomerId,
        setSelectedCustomerId,
        toasts,
        pushToast,
        dismissToast,
        navigate,
        setSelectedGuildId,
        loginDemo,
        logoutDemo,
        simulateAuthState,
        switchDemoProfile,
        resetDemoData,
        recordAudit,
        addActivity,
        toggleQuickBotSetting,
        addAdminUser,
        updateAdminUser,
        revokeAdminUser,
        updateRoleMatrix,
        addCustomer,
        updateCustomer,
        addCustomerNote,
        addManualOrder,
        updateOrderStatus,
        addTicket,
        updateTicket,
        addTicketMessage,
        updateTicketConfig,
        addConversationMessage,
        updateConversation,
        createConversation,
        toggleBotFeature,
        updateBotFeature,
        updateMemberRoles,
        addAutoRoleRule,
        toggleAutoRoleRule,
        deleteAutoRoleRule,
        addModerationCase,
        updateModerationSettings,
        updateCommand,
        saveEmbedTemplate,
        deleteEmbedTemplate,
        saveAutomation,
        toggleAutomation,
        runAutomationTest,
        deleteAutomation,
        updateIntegration,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM deve ser utilizado dentro de CRMProvider');
  return ctx;
}
