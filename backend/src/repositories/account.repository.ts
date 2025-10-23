import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const accountRepository = {
  async listByUser(userId: number) {
    return prisma.account.findMany({
      where: { userId },
      orderBy: { id: "asc" }
    });
  },

  async create(data: Prisma.AccountUncheckedCreateInput) {
    return prisma.account.create({ data });
  },

  async findById(id: number, userId: number) {
    return prisma.account.findFirst({ where: { id, userId } });
  }
};
