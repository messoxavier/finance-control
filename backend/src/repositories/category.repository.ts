import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const categoryRepository = {
  listByUser(userId: number) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    });
  },

  findByName(userId: number, name: string, type: "INCOME" | "EXPENSE") {
    return prisma.category.findFirst({
      where: { userId, type, name }
    });
  },

  create(data: Prisma.CategoryUncheckedCreateInput) {
    return prisma.category.create({ data });
  }
};
