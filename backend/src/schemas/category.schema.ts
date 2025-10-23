import { z } from "zod";

export const CategoryTypeEnum = z.enum(["INCOME", "EXPENSE"]);

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  type: CategoryTypeEnum
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
