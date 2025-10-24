import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const accountRepository = {
  async listByUser(userId: number) {
    return prisma.account.findMany({
      where: { userId, archived: false },
      orderBy: { id: "asc" }
    });
  },

  async create(data: Prisma.AccountUncheckedCreateInput) {
    return prisma.account.create({ data });
  },

  async findById(id: number, userId: number) {
    return prisma.account.findFirst({ where: { id, userId } });
  },

  async update(id: number, userId: number, data: Prisma.AccountUncheckedUpdateInput) {
    return prisma.account.update({ where: { id }, data }); // userId já validado antes
  },

  async archive(id: number) {
    return prisma.account.update({ where: { id }, data: { archived: true } });
  }
};
