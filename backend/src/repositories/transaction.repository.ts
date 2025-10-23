import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const transactionRepository = {
  list(userId: number, filters: {
    from?: string;
    to?: string;
    accountId?: number;
    type?: "INCOME" | "EXPENSE";
  }) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.accountId ? { accountId: filters.accountId } : {}),
      ...(filters.from || filters.to
        ? {
            date: {
              ...(filters.from ? { gte: new Date(filters.from) } : {}),
              ...(filters.to ? { lte: new Date(filters.to) } : {})
            }
          }
        : {})
    };

    return prisma.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { id: "desc" }],
      include: {
        account: { select: { id: true, name: true, type: true } },
        category: { select: { id: true, name: true, type: true } }
      }
    });
  },

  create(data: Prisma.TransactionUncheckedCreateInput) {
    return prisma.transaction.create({ data });
  }
};
