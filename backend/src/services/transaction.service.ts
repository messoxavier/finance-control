import { prisma } from "../config/prisma";
import { CreateTransactionInput, ListTransactionInput } from "../schemas/transaction.schema";
import { transactionRepository } from "../repositories/transaction.repository";

export const transactionService = {
  list(userId: number, filters: ListTransactionInput) {
    return transactionRepository.list(userId, filters);
  },

  async create(userId: number, payload: CreateTransactionInput) {
    // 1) validar que a conta pertence ao usuário
    const account = await prisma.account.findFirst({
      where: { id: payload.accountId, userId }
    });
    if (!account) {
      throw Object.assign(new Error("Conta não encontrada"), { status: 404 });
    }

    // 2) validar categoria (se enviada) pertence ao usuário e tipo bate
    let categoryId: number | undefined = undefined;
    if (payload.categoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: payload.categoryId, userId }
      });
      if (!cat) {
        throw Object.assign(new Error("Categoria não encontrada"), { status: 404 });
      }
      if (cat.type !== payload.type) {
        throw Object.assign(new Error("Categoria não corresponde ao tipo da transação"), { status: 400 });
      }
      categoryId = cat.id;
    }

    const amount = payload.amount;
    const date = new Date(payload.date);

    // 3) transação atômica: cria e atualiza saldo da conta
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          userId,
          accountId: account.id,
          categoryId,
          date,
          description: payload.description ?? null,
          amount,
          type: payload.type
        }
      });

      const op =
        payload.type === "INCOME"
          ? { increment: amount }
          : { decrement: amount };

      await tx.account.update({
        where: { id: account.id },
        data: { balance: op }
      });

      return created;
    });

    return result;
  }
};
