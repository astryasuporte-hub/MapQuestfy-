export type AppRoute =
  | '/'
  | '/clientes'
  | '/pedidos'
  | '/atendimento'
  | '/tickets'
  | '/bot'
  | '/membros'
  | '/cargos'
  | '/moderacao'
  | '/comandos'
  | '/mensagens'
  | '/automacoes'
  | '/permissoes'
  | '/integracoes'
  | '/relatorios'
  | '/auditoria'
  | '/configuracoes'
  | '/login';

export type DataSourceOrigin = 'Sharpify' | 'Shadow Keys' | 'CRM externo' | 'Discord' | 'Manual';

export type AccessProfile =
  | 'Proprietário'
  | 'Superadmin'
  | 'Administrador'
  | 'Moderador'
  | 'Suporte'
  | 'Analista';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'execute'
  | 'admin';

export type PermissionModuleKey =
  | 'tickets.read'
  | 'tickets.manage'
  | 'customers.read'
  | 'customers.manage'
  | 'orders.read'
  | 'orders.manage'
  | 'bot.configure'
  | 'roles.manage'
  | 'moderation.execute'
  | 'integrations.manage'
  | 'permissions.manage'
  | 'audit.read';

export type Permission = Record<PermissionAction, boolean>;

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  discordId: string;
  discordHandle: string;
  profile: AccessProfile;
}

export interface AdminUser {
  id: string;
  discordId: string; // Sempre string até 20 dígitos
  discordHandle: string;
  displayName: string;
  avatarUrl?: string;
  profile: AccessProfile;
  authLinked: boolean;
  addedBy: string;
  addedAt: string;
  lastAccessAt?: string;
  active: boolean;
  moduleOverrides: Partial<Record<PermissionModuleKey, Partial<Permission>>>;
}

export interface Role {
  profile: AccessProfile;
  description: string;
  level: number;
  permissions: Record<PermissionModuleKey, Permission>;
}

export interface DiscordGuild {
  id: string;
  name: string;
  memberCount: number;
  onlineCount: number;
  boostLevel: number;
  iconInitials: string;
  connectedDemo: boolean;
}

export interface DiscordRole {
  id: string;
  guildId: string;
  name: string;
  color: string;
  position: number;
  managed: boolean;
  memberCount: number;
  assignableByBot: boolean;
}

export interface DiscordChannel {
  id: string;
  guildId: string;
  name: string;
  type: 'text' | 'category' | 'announcement' | 'voice';
  parentName?: string;
}

export interface DiscordMember {
  id: string;
  guildId: string;
  discordId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  joinedAt: string;
  verified: boolean;
  roleIds: string[];
  linkedCustomerId?: string;
  warningsCount: number;
  status: 'ativo' | 'silenciado' | 'restrito';
}

export type BotConnectionState = 'desconectado' | 'simulado' | 'erro' | 'conectado';

export interface BotFeatureConfig {
  id: string;
  key:
    | 'welcome'
    | 'goodbye'
    | 'autorole'
    | 'verification'
    | 'tickets'
    | 'moderation'
    | 'antispam'
    | 'antiraid'
    | 'logs'
    | 'slash_commands'
    | 'auto_messages'
    | 'reactions_buttons'
    | 'giveaways'
    | 'sales_notifications'
    | 'admin_notices'
    | 'auto_replies';
  name: string;
  description: string;
  enabled: boolean;
  requiredPermissions: string[];
  channelId?: string;
  updatedAt: string;
}

export interface BotCommand {
  id: string;
  name: string;
  description: string;
  category: 'Geral' | 'Tickets' | 'Loja' | 'Moderação' | 'Cargos';
  enabled: boolean;
  authorizedRoleIds: string[];
  allowedChannelIds: string[];
  requiredPermissions: string[];
  previewResponse: string;
  cooldownSeconds: number;
  ephemeral: boolean;
}

export interface BotConfiguration {
  botName: string;
  botHandle: string;
  connectionState: BotConnectionState;
  version: string;
  lastHeartbeatAt: string;
  quickToggles: {
    autoRole: boolean;
    welcomeMessage: boolean;
    antiSpam: boolean;
    ticketOpening: boolean;
    adminLogs: boolean;
  };
  features: BotFeatureConfig[];
}

export interface CustomerIdentity {
  source: DataSourceOrigin;
  externalId: string;
  label: string;
  syncedAt: string;
  conflictNote?: string;
}

export interface CustomerNote {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  discordId?: string;
  discordHandle?: string;
  source: DataSourceOrigin;
  externalReferences: CustomerIdentity[];
  ordersCount: number;
  totalSpent: number;
  lastPurchaseAt?: string;
  firstContactAt: string;
  lastInteractionAt: string;
  tags: string[];
  status: 'Ativo' | 'VIP' | 'Em risco' | 'Bloqueado';
  assignedAgent?: string;
  syncConflict?: string;
  notes: CustomerNote[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  category: 'Key de Jogo' | 'Assinatura' | 'Software' | 'Gift Card';
  quantity: number;
  unitPrice: number;
}

export type OrderPaymentStatus = 'Aprovado' | 'Pendente' | 'Cancelado' | 'Reembolsado';
export type OrderDeliveryStatus = 'Entregue' | 'Aguardando envio' | 'Em processamento' | 'Falha na entrega';

export interface Order {
  id: string;
  orderNumber: string;
  source: Exclude<DataSourceOrigin, 'Discord'>;
  externalId: string;
  customerId: string;
  customerName: string;
  customerDiscord?: string;
  total: number;
  paymentStatus: OrderPaymentStatus;
  deliveryStatus: OrderDeliveryStatus;
  paymentMethod: string;
  items: OrderItem[];
  timeline: { id: string; label: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export type TicketPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type TicketStatus = 'Aberto' | 'Em atendimento' | 'Aguardando cliente' | 'Resolvido' | 'Fechado';
export type TicketCategory = 'Ativação de Key' | 'Troca de Conta' | 'Reembolso' | 'Pagamento' | 'Suporte Técnico' | 'Dúvida Geral';

export interface TicketMessage {
  id: string;
  authorName: string;
  authorRole: 'cliente' | 'equipe' | 'sistema';
  content: string;
  isInternalNote: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  code: string;
  customerId?: string;
  customerName: string;
  customerDiscord: string;
  customerAvatar?: string;
  subject: string;
  category: TicketCategory;
  assignee: string;
  priority: TicketPriority;
  status: TicketStatus;
  channelName: string;
  relatedOrderNumber?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketConfig {
  openingChannelId: string;
  discordCategoryId: string;
  supportRoleId: string;
  maxTicketsPerUser: number;
  categories: TicketCategory[];
  initialMessage: string;
  closingMessage: string;
  logsChannelId: string;
  enableTranscript: boolean;
  enableRating: boolean;
  panelTitle: string;
  panelDescription: string;
  panelColor: string;
  panelButtons: { label: string; style: 'primary' | 'secondary' | 'success' }[];
}

export interface ConversationMessage {
  id: string;
  sender: 'cliente' | 'atendente' | 'sistema';
  senderName: string;
  content: string;
  isInternal: boolean;
  attachmentName?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerDiscord: string;
  customerAvatar?: string;
  channel: 'Discord DM' | 'Ticket Discord' | 'E-mail' | 'Sharpify Chat';
  status: 'Não lida' | 'Em atendimento' | 'Aguardando' | 'Finalizada';
  priority: TicketPriority;
  assignee: string;
  unread: boolean;
  tags: string[];
  linkedTicketCode?: string;
  messages: ConversationMessage[];
  updatedAt: string;
}

export interface AutoRoleRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  condition: string;
  actionRoleId: string;
  triggerType: 'member_join' | 'order_approved' | 'verified' | 'button_click';
  buttonLabel?: string;
  channelId?: string;
}

export interface ModerationCase {
  id: string;
  type: 'Advertência' | 'Timeout' | 'Expulsão' | 'Banimento';
  targetDiscordId: string;
  targetHandle: string;
  moderatorName: string;
  reason: string;
  duration?: string;
  active: boolean;
  createdAt: string;
}

export interface ModerationSettings {
  spamLimitPer10s: number;
  blockSuspiciousLinks: boolean;
  maxMentionsPerMessage: number;
  antiFloodEnabled: boolean;
  antiRaidEnabled: boolean;
  antiRaidThresholdPerMin: number;
  restrictedChannelIds: string[];
  exemptRoleIds: string[];
  logsChannelId: string;
}

export interface EmbedField {
  id: string;
  name: string;
  value: string;
  inline: boolean;
}

export interface EmbedButton {
  id: string;
  label: string;
  style: 'primary' | 'secondary' | 'success' | 'link';
  url?: string;
}

export interface EmbedTemplate {
  id: string;
  name: string;
  category: string;
  authorName: string;
  title: string;
  description: string;
  color: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  footerText: string;
  fields: EmbedField[];
  buttons: EmbedButton[];
  updatedAt: string;
}

export interface AutomationTrigger {
  type:
    | 'discord_member_join'
    | 'member_verified'
    | 'ticket_opened'
    | 'ticket_closed'
    | 'order_approved'
    | 'order_canceled'
    | 'customer_created'
    | 'integration_event'
    | 'scheduled_event';
  label: string;
}

export interface AutomationCondition {
  field:
    | 'role'
    | 'channel'
    | 'order_value'
    | 'product'
    | 'source'
    | 'status'
    | 'tag'
    | 'discord_linked';
  operator: 'igual' | 'maior_que' | 'contém' | 'verdadeiro';
  value: string;
}

export interface AutomationAction {
  type:
    | 'send_message'
    | 'create_ticket'
    | 'add_role'
    | 'remove_role'
    | 'send_warning'
    | 'add_tag'
    | 'create_activity'
    | 'notify_team';
  target: string;
}

export interface AutomationExecution {
  id: string;
  automationId: string;
  automationName: string;
  status: 'Sucesso' | 'Falha' | 'Simulado';
  summary: string;
  executedAt: string;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  lastRunAt?: string;
  runCount: number;
  lastError?: string;
}

export type IntegrationStatus =
  | 'Não configurado'
  | 'Configurando'
  | 'Conectado'
  | 'Erro'
  | 'Sincronizando'
  | 'Aguardando documentação';

export interface SyncJob {
  id: string;
  integrationId: string;
  startedAt: string;
  finishedAt?: string;
  status: 'Concluído' | 'Em espera' | 'Falha';
  recordsProcessed: number;
  note: string;
}

export interface IntegrationItem {
  id: 'discord' | 'sharpify' | 'shadow_keys' | 'external_crm';
  name: string;
  subtitle: string;
  platformName: string;
  status: IntegrationStatus;
  referenceUrl: string;
  identifier: string;
  enabledFeatures: string[];
  syncIntervalMinutes: number;
  syncDirection: 'Entrada' | 'Saída' | 'Bidirecional';
  conflictStrategy: 'Preservar origem' | 'Priorizar CRM' | 'Solicitar revisão manual';
  fieldMappings: { sourceField: string; targetField: string }[];
  lastSyncAt?: string;
  requiresBackendNote: string;
  awaitingDocumentation: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorDiscordId?: string;
  action: string;
  module: string;
  resource: string;
  result: 'Sucesso' | 'Bloqueado' | 'Erro';
  source: 'Painel Web' | 'Modo Demonstração' | 'Simulação Bot';
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'ticket' | 'pedido' | 'integracao' | 'seguranca';
  read: boolean;
  createdAt: string;
  targetRoute?: AppRoute;
}

export interface ActivityEvent {
  id: string;
  type: 'member_join' | 'role_assigned' | 'order_approved' | 'ticket_created' | 'ticket_resolved' | 'moderation' | 'integration_sync';
  title: string;
  subtitle: string;
  timestampLabel: string;
  createdAt: string;
}

export interface AppSettings {
  organizationName: string;
  timezone: 'America/Sao_Paulo';
  language: 'pt-BR';
  currency: 'BRL';
  dateFormat: 'DD/MM/YYYY';
  interfaceDensity: 'confortavel' | 'compacta';
  sidebarCollapsedDefault: boolean;
  notifications: {
    adminAlerts: boolean;
    supportEvents: boolean;
    priorityTickets: boolean;
    integrationFailures: boolean;
  };
  security: {
    requireConfirmCritical: boolean;
    sessionTimeoutMinutes: number;
    enforceBackendValidationNotice: boolean;
  };
}
