import React, { useState } from 'react';
import { AlertCircle, Clock, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { BrandMascot, PrimaryButton, SecondaryButton, StatusBadge } from '@/src/components/ui/Primitives';

export function LoginPage() {
  const { authStatus, loginDemo, simulateAuthState } = useCRM();
  const [loading, setLoading] = useState(false);
  const [simulatedError, setSimulatedError] = useState<string | null>(null);

  const handleDemoLogin = () => {
    setSimulatedError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loginDemo();
    }, 550);
  };

  return (
    <div className="min-h-screen bg-[#080B09] text-[#F5F7F5] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle radial atmospheric accent */}
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #74C900 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="w-full max-w-md rounded-2xl bg-[#111713] border border-[#29332C] p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <BrandMascot size="lg" />
          <div>
            <div className="font-display font-extrabold text-xl tracking-tight text-[#F5F7F5]">
              MAPQUESTFY
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-display font-bold text-xs tracking-widest text-[#A3FF12]">
                CRM
              </span>
              <span className="text-xs text-[#9DA89F]">· Central Administrativa</span>
            </div>
          </div>
        </div>

        {/* Conditional Auth States */}
        {authStatus === 'denied' && (
          <div className="mb-5 rounded-xl bg-[#F06464]/10 border border-[#F06464]/35 p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#F06464] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-[#F5F7F5]">Acesso negado</div>
              <p className="text-xs text-[#9DA89F] mt-1">
                Este Discord ID não possui autorização administrativa ativa no servidor selecionado. Solicite liberação ao Proprietário.
              </p>
            </div>
          </div>
        )}

        {authStatus === 'expired' && (
          <div className="mb-5 rounded-xl bg-[#F2B84B]/10 border border-[#F2B84B]/35 p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#F2B84B] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-[#F5F7F5]">Sessão expirada</div>
              <p className="text-xs text-[#9DA89F] mt-1">
                Por segurança, sua sessão administrativa foi encerrada. Autentique novamente para continuar.
              </p>
            </div>
          </div>
        )}

        {simulatedError && (
          <div className="mb-5 rounded-xl bg-[#F06464]/10 border border-[#F06464]/35 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F06464] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-[#F5F7F5]">Falha na autenticação</div>
              <p className="text-xs text-[#9DA89F] mt-1">{simulatedError}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="mb-2">
            <StatusBadge label="Ambiente de demonstração" tone="warning" />
          </div>
          <h1 className="text-xl font-display font-bold text-[#F5F7F5]">
            Acesso à operação MapQuestfy
          </h1>
          <p className="text-sm text-[#9DA89F] mt-1.5 leading-relaxed">
            Central restrita à equipe autorizada da MapQuestfy Store. A autenticação OAuth2 com Discord será validada pelo backend em produção.
          </p>
        </div>

        <div className="space-y-3">
          <PrimaryButton
            onClick={handleDemoLogin}
            loading={loading}
            className="w-full h-11 text-sm"
          >
            <LogIn className="w-4 h-4" />
            Entrar com Discord (Modo Demonstração)
          </PrimaryButton>

          <button
            type="button"
            disabled
            className="w-full h-10 px-4 rounded-xl bg-[#171D18] border border-[#29332C] text-xs font-medium text-[#9DA89F] flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" />
            Discord OAuth2 Produção (requer backend configurado)
          </button>
        </div>

        {/* Restricted Access Notice */}
        <div className="mt-6 pt-5 border-t border-[#29332C]/80">
          <div className="flex items-start gap-2.5 text-xs text-[#9DA89F]">
            <Lock className="w-4 h-4 text-[#A3FF12] shrink-0 mt-0.5" />
            <span>
              Acesso restrito: permissões administrativas nunca são validadas apenas no navegador. Nenhum client secret é armazenado no frontend.
            </span>
          </div>

          {/* Demo state testers */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-[#9DA89F]/80">Simular estados:</span>
            <SecondaryButton
              onClick={() => {
                setSimulatedError(null);
                simulateAuthState('denied');
              }}
              className="h-7 px-2.5 py-1 text-[11px]"
            >
              Acesso negado
            </SecondaryButton>
            <SecondaryButton
              onClick={() => {
                setSimulatedError(null);
                simulateAuthState('expired');
              }}
              className="h-7 px-2.5 py-1 text-[11px]"
            >
              Sessão expirada
            </SecondaryButton>
            <SecondaryButton
              onClick={() =>
                setSimulatedError('Resposta simulada: servidor de autenticação OAuth2 ainda não conectado.')
              }
              className="h-7 px-2.5 py-1 text-[11px]"
            >
              Erro OAuth
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
