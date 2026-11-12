import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCode2,
  Headphones,
  Home,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  Plug,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Terminal,
  Ticket,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { AccessProfile, AppRoute } from '@/src/types/crm';
import { BrandMascot, StatusBadge, ToastContainer, UserAvatar } from '@/src/components/ui/Primitives';
import { formatRelativeTimeBR } from '@/src/services/formatters';

interface NavItem {
  route: AppRoute;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const ROUTE_TITLES: Record<AppRoute, { title: string; subtitle: string; group: string }> = {
  '/': { title: 'Visão geral', subtitle: 'Central de controle da MapQuestfy', group: 'Principal' },
  '/clientes': { title: 'Clientes', subtitle: 'CRM completo e histórico unificado', group: 'Principal' },
  '/pedidos': { title: 'Pedidos', subtitle: 'Vendas, origens e entregas digitais', group: 'Principal' },
  '/atendimento': { title: 'Central de Atendimento', subtitle: 'Conversas omnichannel e suporte', group: 'Principal' },
  '/tickets': { title: 'Tickets Discord', subtitle: 'Suporte estruturado e painel Embed', group: 'Principal' },
  '/bot': { title: 'Central do Bot', subtitle: 'Status, recursos e diagnóstico', group: 'Discord' },
  '/membros': { title: 'Membros do Servidor', subtitle: 'Identidades Discord e verificação', group: 'Discord' },
  '/cargos': { title: 'Cargos Automáticos', subtitle: 'Autorole, botões e hierarquia', group: 'Discord' },
  '/moderacao': { title: 'Moderação e Segurança', subtitle: 'Ocorrências, antispam e antiraid', group: 'Discord' },
  '/comandos': { title: 'Comandos Slash', subtitle: 'Permissões, canais e prévias', group: 'Discord' },
  '/mensagens': { title: 'Mensagens e Embeds', subtitle: 'Construtor visual com preview ao vivo', group: 'Discord' },
  '/automacoes': { title: 'Automações Visuais', subtitle: 'Fluxos Gatilho → Condição → Ação', group: 'Discord' },
  '/permissoes': { title: 'Permissões e Admins', subtitle: 'Controle de acesso por Discord ID', group: 'Administração' },
  '/integracoes': { title: 'Central de Integrações', subtitle: 'Discord, Sharpify, Shadow Keys e CRM', group: 'Administração' },
  '/relatorios': { title: 'Relatórios e Analytics', subtitle: 'Indicadores de vendas, CRM e Discord', group: 'Administração' },
  '/auditoria': { title: 'Logs de Auditoria', subtitle: 'Rastreabilidade de ações administrativas', group: 'Administração' },
  '/configuracoes': { title: 'Configurações', subtitle: 'Preferências gerais da operação', group: 'Administração' },
  '/login': { title: 'Autenticação', subtitle: 'Acesso administrativo MapQuestfy', group: 'Sistema' },
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const {
    currentRoute,
    navigate,
    guilds,
    selectedGuild,
    setSelectedGuildId,
    currentUser,
    switchDemoProfile,
    logoutDemo,
    simulateAuthState,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    tickets,
    conversations,
    customers,
    orders,
    settings,
    setSelectedCustomerId,
  } = useCRM();

  const [collapsed, setCollapsed] = useState(settings.sidebarCollapsedDefault);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guildMenuOpen, setGuildMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  const openTicketsCount = tickets.filter(
    (t) => t.status === 'Aberto' || t.status === 'Em atendimento' || t.status === 'Aguardando cliente'
  ).length;
  const unreadConvCount = conversations.filter((c) => c.unread).length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        title: 'Principal',
        items: [
          { route: '/', label: 'Visão geral', icon: Home },
          { route: '/clientes', label: 'Clientes', icon: Users },
          { route: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
          { route: '/atendimento', label: 'Atendimento', icon: Headphones, badge: unreadConvCount || undefined },
          { route: '/tickets', label: 'Tickets', icon: Ticket, badge: openTicketsCount || undefined },
        ],
      },
      {
        title: 'Discord',
        items: [
          { route: '/bot', label: 'Central do Bot', icon: Bot },
          { route: '/membros', label: 'Membros', icon: UserCheck },
          { route: '/cargos', label: 'Cargos', icon: Layers },
          { route: '/moderacao', label: 'Moderação', icon: Shield },
          { route: '/comandos', label: 'Comandos', icon: Terminal },
          { route: '/mensagens', label: 'Mensagens', icon: MessageSquare },
          { route: '/automacoes', label: 'Automações', icon: Zap },
        ],
      },
      {
        title: 'Administração',
        items: [
          { route: '/permissoes', label: 'Permissões', icon: ShieldCheck },
          { route: '/integracoes', label: 'Integrações', icon: Plug },
          { route: '/relatorios', label: 'Relatórios', icon: BarChart3 },
          { route: '/auditoria', label: 'Auditoria', icon: FileCode2 },
          { route: '/configuracoes', label: 'Configurações', icon: Settings },
        ],
      },
    ],
    [openTicketsCount, unreadConvCount]
  );

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return null;
    const matchedRoutes = Object.entries(ROUTE_TITLES)
      .filter(([route, meta]) => route !== '/login' && (meta.title.toLowerCase().includes(q) || meta.subtitle.toLowerCase().includes(q)))
      .slice(0, 4)
      .map(([route, meta]) => ({ type: 'Página', label: meta.title, sub: meta.subtitle, route: route as AppRoute }));

    const matchedCustomers = customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.discordHandle?.toLowerCase().includes(q) ?? false))
      .slice(0, 3)
      .map((c) => ({ type: 'Cliente', label: c.name, sub: c.discordHandle || c.email, route: '/clientes' as AppRoute, customerId: c.id }));

    const matchedOrders = orders
      .filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
      .slice(0, 3)
      .map((o) => ({ type: 'Pedido', label: o.orderNumber, sub: `${o.customerName} · ${o.source}`, route: '/pedidos' as AppRoute }));

    const matchedTickets = tickets
      .filter((t) => t.code.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.customerName.toLowerCase().includes(q))
      .slice(0, 3)
      .map((t) => ({ type: 'Ticket', label: `${t.code} · ${t.subject}`, sub: t.customerName, route: '/tickets' as AppRoute }));

    const combined: {
      type: string;
      label: string;
      sub: string;
      route: AppRoute;
      customerId?: string;
    }[] = [
      ...matchedRoutes,
      ...matchedCustomers,
      ...matchedOrders,
      ...matchedTickets,
    ];
    return combined;
  }, [globalQuery, customers, orders, tickets]);

  const routeMeta = ROUTE_TITLES[currentRoute] || ROUTE_TITLES['/'];

  const handleNavClick = (route: AppRoute) => {
    navigate(route);
    setMobileOpen(false);
  };

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-[#0B0F0C] border-r border-[#29332C]">
      {/* Brand Header */}
      <div className="px-4 py-4 flex items-center justify-between gap-2 border-b border-[#29332C]/70">
        <button
          type="button"
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-3 text-left min-w-0 cursor-pointer"
        >
          <BrandMascot size="md" />
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <div className="font-display font-extrabold text-[15px] tracking-tight text-[#F5F7F5] leading-none">
                MAPQUESTFY
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-display font-bold text-xs tracking-widest text-[#A3FF12]">
                  CRM
                </span>
                <span className="h-[1px] w-7 bg-[#74C900]/50" aria-hidden="true" />
              </div>
            </div>
          )}
        </button>

        {isMobile ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
            className="p-2 rounded-lg text-[#9DA89F] hover:text-[#F5F7F5] hover:bg-[#171D18]"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="hidden lg:inline-flex p-1.5 rounded-lg text-[#9DA89F] hover:text-[#F5F7F5] hover:bg-[#171D18] transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Menu principal">
        {navGroups.map((group, groupIdx) => (
          <div key={group.title}>
            {(!collapsed || isMobile) && (
              <div className="px-3 mb-1.5 text-[11px] font-medium text-[#9DA89F]/70">
                {group.title}
              </div>
            )}
            {collapsed && !isMobile && groupIdx > 0 && (
              <div className="my-2 border-t border-[#29332C]/70" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => handleNavClick(item.route)}
                    title={collapsed && !isMobile ? item.label : undefined}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-[#294C10] to-[#17280D] text-[#F5F7F5] border border-[#74C900]/40'
                        : 'text-[#9DA89F] hover:text-[#F5F7F5] hover:bg-[#111713] border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 ${
                          active ? 'text-[#A3FF12]' : 'text-[#9DA89F]'
                        }`}
                      />
                      {(!collapsed || isMobile) && (
                        <span className="truncate whitespace-nowrap">{item.label}</span>
                      )}
                    </span>
                    {(!collapsed || isMobile) && item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono tabular-nums ${
                          active
                            ? 'bg-[#A3FF12]/20 text-[#A3FF12]'
                            : 'bg-[#171D18] text-[#9DA89F]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#29332C]/70">
        {collapsed && !isMobile ? (
          <div className="flex justify-center" title="Ambiente de demonstração">
            <Activity className="w-4 h-4 text-[#F2B84B]" />
          </div>
        ) : (
          <div className="rounded-xl bg-[#111713] border border-[#29332C] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-[#F5F7F5]">Ambiente de demonstração</span>
              <span className="text-[10px] font-mono text-[#A3FF12] tabular-nums">V1.0</span>
            </div>
            <p className="text-[11px] text-[#9DA89F] mt-1 leading-relaxed">
              MapQuestfy CRM · Dados simulados locais sem API conectada.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080B09] text-[#F5F7F5] flex">
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`hidden md:block shrink-0 sticky top-0 h-screen transition-[width] duration-200 ${
          collapsed ? 'w-[76px]' : 'w-[252px]'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[272px] max-w-[85vw] h-full z-10">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[#080B09]/92 backdrop-blur-md border-b border-[#29332C]/80 px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Mobile Trigger + Title / Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir navegação"
                className="md:hidden p-2 rounded-xl bg-[#111713] border border-[#29332C] text-[#F5F7F5] hover:border-[#A3FF12]/40 shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#9DA89F]">
                  <span>MapQuestfy</span>
                  <span>/</span>
                  <span>{routeMeta.group}</span>
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-display font-bold text-base sm:text-lg text-[#F5F7F5] truncate">
                    {routeMeta.title}
                  </span>
                  <span className="hidden xl:inline-block text-xs text-[#9DA89F] truncate">
                    · {routeMeta.subtitle}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Global Search + Guild Selector + Notifications + User Menu */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Global Search */}
              <div className="relative hidden lg:block w-64">
                <Search className="w-4 h-4 text-[#9DA89F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                  placeholder="Buscar cliente, pedido, ticket..."
                  className="w-full h-9 pl-9 pr-7 rounded-xl bg-[#111713] border border-[#29332C] text-xs text-[#F5F7F5] placeholder:text-[#9DA89F]/70 focus:border-[#A3FF12]/60 focus:outline-none"
                />
                {globalQuery && (
                  <button
                    type="button"
                    onClick={() => setGlobalQuery('')}
                    aria-label="Limpar busca global"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9DA89F] hover:text-[#F5F7F5]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {searchResults && (
                  <div className="absolute left-0 right-0 mt-2 rounded-xl bg-[#111713] border border-[#29332C] shadow-2xl p-2 z-50">
                    {searchResults.length === 0 ? (
                      <div className="p-3 text-xs text-[#9DA89F] text-center">
                        Nenhum resultado encontrado para "{globalQuery}".
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.map((res, i) => (
                          <button
                            key={`${res.route}-${i}`}
                            type="button"
                            onClick={() => {
                              navigate(res.route);
                              if ('customerId' in res && res.customerId) {
                                setSelectedCustomerId(res.customerId);
                              }
                              setGlobalQuery('');
                            }}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left hover:bg-[#171D18] transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-[#F5F7F5] truncate">{res.label}</div>
                              <div className="text-[11px] text-[#9DA89F] truncate">{res.sub}</div>
                            </div>
                            <span className="text-[10px] font-mono text-[#A3FF12] shrink-0">{res.type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Guild Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setGuildMenuOpen((v) => !v);
                    setNotifOpen(false);
                    setUserMenuOpen(false);
                  }}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-[#111713] border border-[#29332C] hover:border-[#3E4C42] text-xs font-medium text-[#F5F7F5] transition-colors cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-md bg-[#5865F2]/20 text-[#72A8FF] flex items-center justify-center font-display font-bold text-[10px]">
                    {selectedGuild.iconInitials}
                  </span>
                  <span className="hidden sm:inline max-w-[160px] truncate">{selectedGuild.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9DA89F]" />
                </button>

                {guildMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#111713] border border-[#29332C] shadow-2xl p-1.5 z-50">
                    <div className="px-2.5 py-1.5 text-[11px] text-[#9DA89F]">
                      Servidores (Modo demonstração)
                    </div>
                    {guilds.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setSelectedGuildId(g.id);
                          setGuildMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          g.id === selectedGuild.id
                            ? 'bg-[#294C10]/60 text-[#F5F7F5]'
                            : 'text-[#9DA89F] hover:bg-[#171D18] hover:text-[#F5F7F5]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{g.name}</div>
                          <div className="text-[11px] text-[#9DA89F] tabular-nums">
                            {g.memberCount.toLocaleString('pt-BR')} membros
                          </div>
                        </div>
                        {g.id === selectedGuild.id && (
                          <span className="text-[10px] font-medium text-[#A3FF12]">Ativo</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setGuildMenuOpen(false);
                    setUserMenuOpen(false);
                  }}
                  aria-label="Notificações"
                  className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#111713] border border-[#29332C] hover:border-[#3E4C42] text-[#9DA89F] hover:text-[#F5F7F5] transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#A3FF12] text-[#080B09] text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-[#111713] border border-[#29332C] shadow-2xl p-2 z-50">
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#29332C]/70">
                      <span className="text-xs font-semibold text-[#F5F7F5]">Notificações</span>
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1 text-[11px] text-[#A3FF12] hover:underline cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Marcar todas
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#29332C]/60">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.targetRoute) navigate(n.targetRoute);
                            setNotifOpen(false);
                          }}
                          className={`w-full text-left p-2.5 hover:bg-[#171D18] transition-colors cursor-pointer ${
                            !n.read ? 'bg-[#171D18]/40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-[#F5F7F5] truncate">{n.title}</span>
                            {!n.read && <span className="text-[10px] text-[#A3FF12] shrink-0">Nova</span>}
                          </div>
                          <p className="text-[11px] text-[#9DA89F] mt-0.5 line-clamp-2">{n.description}</p>
                          <span className="text-[10px] text-[#9DA89F]/70 mt-1 block">
                            {formatRelativeTimeBR(n.createdAt)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative pl-1 sm:border-l sm:border-[#29332C]">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen((v) => !v);
                    setGuildMenuOpen(false);
                    setNotifOpen(false);
                  }}
                  className="inline-flex items-center gap-2.5 py-1 px-1.5 rounded-xl hover:bg-[#111713] transition-colors cursor-pointer"
                >
                  <UserAvatar src={currentUser.avatarUrl} name={currentUser.name} size="md" />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-[#F5F7F5] leading-tight">{currentUser.name}</div>
                    <div className="text-[11px] text-[#9DA89F] leading-tight">{currentUser.profile}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9DA89F] hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#111713] border border-[#29332C] shadow-2xl p-2 z-50">
                    <div className="px-2.5 py-2 border-b border-[#29332C]/70">
                      <div className="text-xs font-semibold text-[#F5F7F5]">{currentUser.name}</div>
                      <div className="text-[11px] text-[#9DA89F] font-mono tabular-nums mt-0.5">
                        Discord ID: {currentUser.discordId}
                      </div>
                      <div className="mt-1.5">
                        <StatusBadge label="Sessão Demonstrativa" tone="warning" />
                      </div>
                    </div>

                    <div className="py-1.5 border-b border-[#29332C]/70">
                      <div className="px-2.5 py-1 text-[11px] text-[#9DA89F]">
                        Testar visualização por perfil:
                      </div>
                      <div className="px-2">
                        <select
                          value={currentUser.profile}
                          onChange={(e) => switchDemoProfile(e.target.value as AccessProfile)}
                          className="w-full h-8 px-2 rounded-lg bg-[#0B0F0C] border border-[#29332C] text-xs text-[#F5F7F5]"
                        >
                          {(['Proprietário', 'Superadmin', 'Administrador', 'Moderador', 'Suporte', 'Analista'] as AccessProfile[]).map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-1.5 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          simulateAuthState('expired');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#9DA89F] hover:bg-[#171D18] hover:text-[#F5F7F5] cursor-pointer"
                      >
                        Simular sessão expirada
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          simulateAuthState('denied');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#9DA89F] hover:bg-[#171D18] hover:text-[#F5F7F5] cursor-pointer"
                      >
                        Simular acesso negado
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logoutDemo();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#F06464] hover:bg-[#F06464]/10 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair para tela de login
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
