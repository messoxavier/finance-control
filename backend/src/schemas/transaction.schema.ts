import { z } from "zod";

export const TransactionTypeEnum = z.enum(["INCOME", "EXPENSE"]);

export const CreateTransactionSchema = z.object({
  accountId: z.number().int().positive(),
  categoryId: z.number().int().positive().optional(), // opcional
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida"),
  description: z.string().max(200).optional(),
  amount: z.number().positive("Valor deve ser > 0"),
  type: TransactionTypeEnum
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

export const ListTransactionSchema = z.object({
  from: z.string().optional(), 
  to: z.string().optional(),   
  accountId: z.coerce.number().int().positive().optional(),
  type: TransactionTypeEnum.optional()
});
export type ListTransactionInput = z.infer<typeof ListTransactionSchema>;
