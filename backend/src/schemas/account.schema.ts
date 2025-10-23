import { z } from "zod";

export const AccountTypeEnum = z.enum(["CHECKING", "SAVINGS", "CASH", "CREDIT_CARD"]);

export const CreateAccountSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  type: AccountTypeEnum,
  balance: z.coerce.number().min(0).optional().default(0)
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
