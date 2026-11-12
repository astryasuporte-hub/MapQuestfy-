import { z } from 'zod';

/**
 * Discord IDs são snowflakes numéricos de até 20 dígitos.
 * Sempre validados e armazenados como strings (nunca Number).
 */
export const discordIdSchema = z
  .string()
  .trim()
  .min(17, 'O Discord ID deve ter entre 17 e 20 dígitos numéricos.')
  .max(20, 'O Discord ID deve ter no máximo 20 dígitos numéricos.')
  .regex(/^\d+$/, 'Informe apenas números válidos para o Discord ID.');

export const optionalDiscordIdSchema = z
  .string()
  .trim()
  .refine(
    (val) => val === '' || (/^\d+$/.test(val) && val.length >= 17 && val.length <= 20),
    'Discord ID opcional inválido (deve conter 17 a 20 dígitos numéricos).'
  );

export const customerFormSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  phone: z.string().trim().optional(),
  discordId: optionalDiscordIdSchema,
  discordHandle: z.string().trim().optional(),
  source: z.enum(['Sharpify', 'Shadow Keys', 'CRM externo', 'Discord', 'Manual']),
  status: z.enum(['Ativo', 'VIP', 'Em risco', 'Bloqueado']),
  tagsText: z.string().optional(),
});

export const ticketFormSchema = z.object({
  customerName: z.string().trim().min(2, 'Informe o nome do cliente.'),
  customerDiscord: z.string().trim().min(2, 'Informe o @ ou usuário Discord.'),
  subject: z.string().trim().min(4, 'Assunto deve ter pelo menos 4 caracteres.'),
  category: z.enum([
    'Ativação de Key',
    'Troca de Conta',
    'Reembolso',
    'Pagamento',
    'Suporte Técnico',
    'Dúvida Geral',
  ]),
  priority: z.enum(['Baixa', 'Média', 'Alta', 'Urgente']),
  assignee: z.string().trim().min(2, 'Informe o responsável.'),
  relatedOrderNumber: z.string().trim().optional(),
  initialMessage: z.string().trim().min(5, 'Descreva a solicitação inicial.'),
});

export const manualOrderSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente.'),
  productName: z.string().trim().min(2, 'Informe o produto.'),
  category: z.enum(['Key de Jogo', 'Assinatura', 'Software', 'Gift Card']),
  quantity: z.number().int().min(1, 'Quantidade mínima é 1.'),
  unitPrice: z.number().positive('O valor unitário deve ser maior que zero.'),
  paymentMethod: z.string().trim().min(2, 'Informe o meio de pagamento.'),
});

export const adminAuthorizeSchema = z.object({
  discordId: discordIdSchema,
  displayName: z.string().trim().min(2, 'Informe o nome de exibição.'),
  discordHandle: z.string().trim().min(2, 'Informe o @ do Discord.'),
  profile: z.enum([
    'Proprietário',
    'Superadmin',
    'Administrador',
    'Moderador',
    'Suporte',
    'Analista',
  ]),
});

export const embedTemplateSchema = z.object({
  name: z.string().trim().min(2, 'Dê um nome ao modelo.'),
  category: z.string().trim().min(2, 'Informe a categoria.'),
  title: z.string().trim().min(2, 'Informe o título da embed.'),
  description: z.string().trim().min(4, 'Informe a descrição da embed.'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Informe uma cor hexadecimal válida.'),
});
