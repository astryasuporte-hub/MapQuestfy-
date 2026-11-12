import React from 'react';
import { CRMProvider, useCRM } from '@/src/context/CRMContext';
import { AppLayout } from '@/src/components/layout/AppLayout';
import { VisaoGeralPage } from '@/src/pages/VisaoGeralPage';
import { ClientesPage } from '@/src/pages/ClientesPage';
import { PedidosPage } from '@/src/pages/PedidosPage';
import { AtendimentoPage } from '@/src/pages/AtendimentoPage';
import { TicketsPage } from '@/src/pages/TicketsPage';
import { BotCentralPage } from '@/src/pages/BotCentralPage';
import { MembrosPage } from '@/src/pages/MembrosPage';
import { CargosPage } from '@/src/pages/CargosPage';
import { ModeracaoPage } from '@/src/pages/ModeracaoPage';
import { ComandosPage } from '@/src/pages/ComandosPage';
import { MensagensPage } from '@/src/pages/MensagensPage';
import { AutomacoesPage } from '@/src/pages/AutomacoesPage';
import { PermissoesPage } from '@/src/pages/PermissoesPage';
import { IntegracoesPage } from '@/src/pages/IntegracoesPage';
import { RelatoriosPage } from '@/src/pages/RelatoriosPage';
import { AuditoriaPage } from '@/src/pages/AuditoriaPage';
import { ConfiguracoesPage } from '@/src/pages/ConfiguracoesPage';
import { LoginPage } from '@/src/pages/LoginPage';

function CRMRoutes() {
  const { authStatus, currentRoute } = useCRM();

  if (authStatus !== 'authenticated' || currentRoute === '/login') {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentRoute) {
      case '/':
        return <VisaoGeralPage />;
      case '/clientes':
        return <ClientesPage />;
      case '/pedidos':
        return <PedidosPage />;
      case '/atendimento':
        return <AtendimentoPage />;
      case '/tickets':
        return <TicketsPage />;
      case '/bot':
        return <BotCentralPage />;
      case '/membros':
        return <MembrosPage />;
      case '/cargos':
        return <CargosPage />;
      case '/moderacao':
        return <ModeracaoPage />;
      case '/comandos':
        return <ComandosPage />;
      case '/mensagens':
        return <MensagensPage />;
      case '/automacoes':
        return <AutomacoesPage />;
      case '/permissoes':
        return <PermissoesPage />;
      case '/integracoes':
        return <IntegracoesPage />;
      case '/relatorios':
        return <RelatoriosPage />;
      case '/auditoria':
        return <AuditoriaPage />;
      case '/configuracoes':
        return <ConfiguracoesPage />;
      default:
        return <VisaoGeralPage />;
    }
  };

  return <AppLayout>{renderPage()}</AppLayout>;
}

export default function App() {
  return (
    <CRMProvider>
      <CRMRoutes />
    </CRMProvider>
  );
}
