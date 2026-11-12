import React, { useState } from 'react';
import { Copy, Plus, Save, Trash2 } from 'lucide-react';
import { useCRM } from '@/src/context/CRMContext';
import { EmbedTemplate } from '@/src/types/crm';
import { embedTemplateSchema } from '@/src/schemas/validation';
import {
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SettingsCard,
} from '@/src/components/ui/Primitives';

export function MensagensPage() {
  const { embedTemplates, saveEmbedTemplate, deleteEmbedTemplate, pushToast } = useCRM();

  const [selectedId, setSelectedId] = useState<string>(embedTemplates[0]?.id || '');
  const currentTemplate =
    embedTemplates.find((t) => t.id === selectedId) || embedTemplates[0];

  const [draft, setDraft] = useState<EmbedTemplate>(currentTemplate);
  const [error, setError] = useState<string | null>(null);

  const selectTemplate = (tpl: EmbedTemplate) => {
    setSelectedId(tpl.id);
    setDraft(tpl);
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = embedTemplateSchema.safeParse({
      name: draft.name,
      category: draft.category,
      title: draft.title,
      description: draft.description,
      color: draft.color,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Verifique os campos da Embed.');
      return;
    }
    saveEmbedTemplate(draft);
  };

  const handleDuplicate = () => {
    const copy: EmbedTemplate = {
      ...draft,
      id: `emb-${Date.now()}`,
      name: `${draft.name} (Cópia)`,
      updatedAt: new Date().toISOString(),
    };
    saveEmbedTemplate(copy);
    setSelectedId(copy.id);
    setDraft(copy);
  };

  const handleNew = () => {
    const blank: EmbedTemplate = {
      id: `emb-${Date.now()}`,
      name: 'Novo Modelo Embed',
      category: 'Anúncio',
      authorName: 'MapQuestfy Store',
      title: 'Título da mensagem',
      description: 'Escreva aqui o conteúdo principal da mensagem Embed para o Discord.',
      color: '#A3FF12',
      footerText: 'MapQuestfy • Mensagem oficial',
      fields: [],
      buttons: [],
      updatedAt: new Date().toISOString(),
    };
    saveEmbedTemplate(blank);
    setSelectedId(blank.id);
    setDraft(blank);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Construtor de Mensagens e Embeds"
        subtitle="Editor visual de mensagens Discord salvo localmente no modo demonstração"
        actions={
          <PrimaryButton onClick={handleNew}>
            <Plus className="w-4 h-4" />
            Novo modelo
          </PrimaryButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Saved Templates List */}
        <div className="lg:col-span-3 space-y-2">
          <SettingsCard title={`Modelos (${embedTemplates.length})`}>
            <div className="space-y-1.5 max-h-[540px] overflow-y-auto">
              {embedTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => selectTemplate(tpl)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    draft.id === tpl.id
                      ? 'bg-[#294C10]/60 border-[#74C900]/50 text-[#F5F7F5]'
                      : 'bg-[#0B0F0C] border-[#29332C] text-[#9DA89F] hover:text-[#F5F7F5]'
                  }`}
                >
                  <div className="font-semibold text-[#F5F7F5] truncate">{tpl.name}</div>
                  <div className="text-[11px] text-[#9DA89F] mt-0.5">{tpl.category}</div>
                </button>
              ))}
            </div>
          </SettingsCard>
        </div>

        {/* Editor Form */}
        <div className="lg:col-span-5">
          <SettingsCard
            title="Editor de Embed"
            actions={
              <div className="flex items-center gap-1.5">
                <SecondaryButton onClick={handleDuplicate} className="h-8 px-2.5 text-xs">
                  <Copy className="w-3.5 h-3.5" />
                  Duplicar
                </SecondaryButton>
                {embedTemplates.length > 1 && (
                  <SecondaryButton
                    onClick={() => {
                      deleteEmbedTemplate(draft.id);
                      const fallback = embedTemplates.find((t) => t.id !== draft.id);
                      if (fallback) selectTemplate(fallback);
                    }}
                    className="h-8 px-2.5 text-xs text-[#F06464]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </SecondaryButton>
                )}
              </div>
            }
          >
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#9DA89F] mb-1">Nome do modelo</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                  />
                </div>
                <div>
                  <label className="block text-[#9DA89F] mb-1">Categoria</label>
                  <input
                    type="text"
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[#9DA89F] mb-1">Autor</label>
                  <input
                    type="text"
                    value={draft.authorName}
                    onChange={(e) => setDraft({ ...draft, authorName: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                  />
                </div>
                <div>
                  <label className="block text-[#9DA89F] mb-1">Cor lateral</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draft.color}
                      onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                      className="h-9 w-12 rounded-lg bg-[#0B0F0C] border border-[#29332C] cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-[#9DA89F]">{draft.color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#9DA89F] mb-1">Título</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                />
              </div>

              <div>
                <label className="block text-[#9DA89F] mb-1">Descrição</label>
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                />
              </div>

              <div>
                <label className="block text-[#9DA89F] mb-1">Rodapé</label>
                <input
                  type="text"
                  value={draft.footerText}
                  onChange={(e) => setDraft({ ...draft, footerText: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                />
              </div>

              {/* Fields Builder */}
              <div className="pt-2 border-t border-[#29332C]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#F5F7F5]">Campos adicionais ({draft.fields.length})</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        fields: [
                          ...draft.fields,
                          { id: `ef-${Date.now()}`, name: 'Novo campo', value: 'Valor', inline: true },
                        ],
                      })
                    }
                    className="text-[#A3FF12] hover:underline cursor-pointer"
                  >
                    + Adicionar campo
                  </button>
                </div>
                <div className="space-y-2">
                  {draft.fields.map((f, idx) => (
                    <div key={f.id} className="grid grid-cols-5 gap-1.5 items-center">
                      <input
                        type="text"
                        value={f.name}
                        onChange={(e) => {
                          const next = [...draft.fields];
                          next[idx] = { ...f, name: e.target.value };
                          setDraft({ ...draft, fields: next });
                        }}
                        className="col-span-2 h-8 px-2 rounded-lg bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                      />
                      <input
                        type="text"
                        value={f.value}
                        onChange={(e) => {
                          const next = [...draft.fields];
                          next[idx] = { ...f, value: e.target.value };
                          setDraft({ ...draft, fields: next });
                        }}
                        className="col-span-2 h-8 px-2 rounded-lg bg-[#0B0F0C] border border-[#29332C] text-[#F5F7F5]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            fields: draft.fields.filter((item) => item.id !== f.id),
                          })
                        }
                        className="h-8 rounded-lg bg-[#171D18] text-[#F06464] flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-[#F06464]">{error}</p>}

              <PrimaryButton type="submit" className="w-full">
                <Save className="w-4 h-4" />
                Salvar modelo localmente
              </PrimaryButton>
            </form>
          </SettingsCard>
        </div>

        {/* Live Discord Preview */}
        <div className="lg:col-span-4">
          <SettingsCard title="Prévia ao vivo (Discord)" description="Simulação fiel da aparência no servidor">
            <div className="rounded-xl bg-[#313338] p-4 text-[#DBDEE1] space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#080B09] flex items-center justify-center text-[10px] font-bold text-[#A3FF12]">
                  MQ
                </div>
                <span className="text-sm font-semibold text-white">MapQuestfy Guard</span>
                <span className="px-1.5 py-0.5 rounded bg-[#5865F2] text-[10px] font-semibold text-white">
                  APP
                </span>
              </div>

              <div
                className="rounded-md bg-[#2B2D31] p-3.5 space-y-2.5"
                style={{ borderLeft: `4px solid ${draft.color}` }}
              >
                {draft.authorName && (
                  <div className="text-[11px] font-semibold text-white/80">{draft.authorName}</div>
                )}
                <div className="text-sm font-bold text-white">{draft.title}</div>
                <p className="text-xs text-[#DBDEE1]/90 whitespace-pre-line leading-relaxed">
                  {draft.description}
                </p>

                {draft.fields.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {draft.fields.map((f) => (
                      <div key={f.id} className={f.inline ? '' : 'col-span-2'}>
                        <div className="text-[11px] font-bold text-white">{f.name}</div>
                        <div className="text-xs text-[#DBDEE1]/85">{f.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {draft.footerText && (
                  <div className="text-[11px] text-[#949BA4] pt-1 border-t border-white/10">
                    {draft.footerText}
                  </div>
                )}
              </div>

              {draft.buttons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {draft.buttons.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() =>
                        pushToast({ type: 'info', title: `Prévia do botão: ${b.label}` })
                      }
                      className="px-3 py-1.5 rounded bg-[#5865F2] text-xs font-medium text-white cursor-pointer"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
