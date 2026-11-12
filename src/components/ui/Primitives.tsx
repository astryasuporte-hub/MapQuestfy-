import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Hash,
  Info,
  Loader2,
  Search,
  ShieldAlert,
  X,
  XCircle,
} from 'lucide-react';
import { BRAND_ASSETS } from '@/src/data/seedData';
import { useCRM } from '@/src/context/CRMContext';

export function BrandMascot({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [imgError, setImgError] = React.useState(false);
  const dims = size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

  if (imgError) {
    return (
      <div
        className={`${dims} rounded-xl bg-[#111713] border border-[#29332C] flex items-center justify-center shrink-0`}
        aria-label="MapQuestfy Mascote"
      >
        <span className="font-display font-extrabold text-sm text-[#A3FF12]">MQ</span>
      </div>
    );
  }

  return (
    <img
      src={BRAND_ASSETS.mascotUrl}
      alt="Mascote MapQuestfy"
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`${dims} rounded-xl object-cover border border-[#29332C] bg-[#0B0F0C] shrink-0`}
    />
  );
}

export function UserAvatar({
  src,
  name,
  size = 'md',
}: {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [failed, setFailed] = React.useState(false);
  const dims = size === 'lg' ? 'w-12 h-12 text-sm' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-xs';
  const initials = name
    .replace('@', '')
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'MQ';

  if (!src || failed) {
    return (
      <div
        className={`${dims} rounded-full bg-[#171D18] border border-[#29332C] flex items-center justify-center font-display font-semibold text-[#A3FF12] shrink-0`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${dims} rounded-full object-cover border border-[#29332C] bg-[#171D18] shrink-0`}
    />
  );
}

export type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'accent';

export function StatusBadge({
  label,
  tone = 'neutral',
  showIcon = false,
}: {
  label: string;
  tone?: BadgeTone;
  showIcon?: boolean;
}) {
  const styles: Record<BadgeTone, string> = {
    success: 'bg-[#36D475]/12 text-[#36D475] border-[#36D475]/30',
    warning: 'bg-[#F2B84B]/12 text-[#F2B84B] border-[#F2B84B]/30',
    error: 'bg-[#F06464]/12 text-[#F06464] border-[#F06464]/30',
    info: 'bg-[#72A8FF]/12 text-[#72A8FF] border-[#72A8FF]/30',
    accent: 'bg-[#A3FF12]/12 text-[#A3FF12] border-[#A3FF12]/35',
    neutral: 'bg-[#171D18] text-[#9DA89F] border-[#29332C]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap shrink-0 ${styles[tone]}`}
    >
      {showIcon && tone === 'success' && <CheckCircle2 className="w-3 h-3 shrink-0" />}
      {showIcon && tone === 'warning' && <AlertTriangle className="w-3 h-3 shrink-0" />}
      {showIcon && tone === 'error' && <XCircle className="w-3 h-3 shrink-0" />}
      {showIcon && tone === 'info' && <Info className="w-3 h-3 shrink-0" />}
      <span>{label}</span>
    </span>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-150 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        checked
          ? 'bg-[#A3FF12] border-[#A3FF12]'
          : 'bg-[#171D18] border-[#29332C] hover:border-[#3E4C42]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full transition-transform duration-150 ${
          checked ? 'translate-x-6 bg-[#080B09]' : 'translate-x-1 bg-[#9DA89F]'
        }`}
      />
    </button>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-[#9DA89F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-8 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5] placeholder:text-[#9DA89F]/70 focus:border-[#A3FF12]/60 focus:outline-none transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9DA89F] hover:text-[#F5F7F5] p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-display font-bold tracking-tight text-[#F5F7F5] leading-tight">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[#9DA89F] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}

export function SettingsCard({
  title,
  description,
  actions,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl bg-[#111713] border border-[#29332C] p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-display font-semibold text-[#F5F7F5]">{title}</h2>
          {description && <p className="text-xs text-[#9DA89F] mt-0.5">{description}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#111713] border border-dashed border-[#29332C] p-8 text-center flex flex-col items-center justify-center">
      <div className="w-11 h-11 rounded-xl bg-[#171D18] border border-[#29332C] flex items-center justify-center text-[#9DA89F] mb-3">
        {icon || <Info className="w-5 h-5" />}
      </div>
      <h3 className="text-sm font-display font-semibold text-[#F5F7F5]">{title}</h3>
      <p className="text-xs text-[#9DA89F] mt-1 max-w-md">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Não foi possível carregar os dados',
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl bg-[#111713] border border-[#F06464]/35 p-6 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#F06464]/15 text-[#F06464] flex items-center justify-center shrink-0">
        <ShieldAlert className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-display font-semibold text-[#F5F7F5]">{title}</h3>
        <p className="text-xs text-[#9DA89F] mt-1">{description}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 px-3 py-1.5 rounded-lg bg-[#171D18] border border-[#29332C] text-xs font-medium text-[#F5F7F5] hover:border-[#A3FF12]/50"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-xl bg-[#111713] border border-[#29332C]/60"
        />
      ))}
    </div>
  );
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#111713] border border-[#29332C] p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              danger ? 'bg-[#F06464]/15 text-[#F06464]' : 'bg-[#F2B84B]/15 text-[#F2B84B]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-display font-semibold text-[#F5F7F5]">{title}</h3>
            <p className="text-sm text-[#9DA89F] mt-1">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[#171D18] border border-[#29332C] text-sm font-medium text-[#F5F7F5] hover:border-[#3E4C42] transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              danger
                ? 'bg-[#F06464] text-[#080B09] hover:bg-[#f57a7a]'
                : 'bg-[#A3FF12] text-[#080B09] hover:bg-[#b5ff3b]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DiscordUserBadge({
  handle,
  discordId,
  avatarUrl,
}: {
  handle: string;
  discordId?: string;
  avatarUrl?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <UserAvatar src={avatarUrl} name={handle} size="sm" />
      <div className="min-w-0">
        <div className="text-xs font-medium text-[#F5F7F5] truncate">{handle}</div>
        {discordId && (
          <div className="text-[11px] font-mono text-[#9DA89F] tabular-nums truncate">
            ID {discordId}
          </div>
        )}
      </div>
    </div>
  );
}

export function DiscordRoleSelector({
  value,
  onChange,
  guildId,
  label,
}: {
  value: string;
  onChange: (roleId: string) => void;
  guildId?: string;
  label?: string;
}) {
  const { roles, selectedGuildId } = useCRM();
  const targetGuild = guildId || selectedGuildId;
  const filtered = roles.filter((r) => r.guildId === targetGuild || r.guildId === 'guild-mq-main');

  return (
    <div>
      {label && <label className="block text-xs font-medium text-[#9DA89F] mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5] focus:border-[#A3FF12]/60 focus:outline-none"
      >
        {filtered.map((role) => (
          <option key={role.id} value={role.id}>
            @{role.name} ({role.memberCount} membros)
          </option>
        ))}
      </select>
    </div>
  );
}

export function DiscordChannelSelector({
  value,
  onChange,
  typeFilter,
  label,
}: {
  value: string;
  onChange: (channelId: string) => void;
  typeFilter?: 'text' | 'category' | 'announcement';
  label?: string;
}) {
  const { channels } = useCRM();
  const filtered = typeFilter ? channels.filter((c) => c.type === typeFilter) : channels;

  return (
    <div>
      {label && <label className="block text-xs font-medium text-[#9DA89F] mb-1.5">{label}</label>}
      <div className="relative">
        <Hash className="w-3.5 h-3.5 text-[#9DA89F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 pl-8 pr-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-sm text-[#F5F7F5] focus:border-[#A3FF12]/60 focus:outline-none"
        >
          {filtered.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function BackendHonestNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-[#171D18] border border-[#29332C] px-3.5 py-2.5 text-xs text-[#9DA89F]">
      <Info className="w-4 h-4 text-[#72A8FF] shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useCRM();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]">
      {toasts.map((toast) => {
        const borderMap = {
          success: 'border-[#36D475]/50',
          error: 'border-[#F06464]/50',
          warning: 'border-[#F2B84B]/50',
          info: 'border-[#72A8FF]/50',
        };
        return (
          <div
            key={toast.id}
            className={`rounded-xl bg-[#111713] border ${borderMap[toast.type]} p-3.5 shadow-xl flex items-start gap-3`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#36D475]" />}
              {toast.type === 'error' && <XCircle className="w-4 h-4 text-[#F06464]" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#F2B84B]" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#72A8FF]" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F5F7F5]">{toast.title}</p>
              {toast.description && (
                <p className="text-[11px] text-[#9DA89F] mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Fechar aviso"
              className="text-[#9DA89F] hover:text-[#F5F7F5] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#A3FF12] text-[#080B09] text-sm font-semibold hover:bg-[#b5ff3b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#171D18] border border-[#29332C] text-[#F5F7F5] text-sm font-medium hover:border-[#3E4C42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function BreadcrumbNav({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#9DA89F]" aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
          {item.onClick ? (
            <button
              type="button"
              onClick={item.onClick}
              className="hover:text-[#F5F7F5] transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-[#F5F7F5] font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
