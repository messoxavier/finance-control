import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("demo123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@finance.local" },
    update: { passwordHash: hash },
    create: {
      name: "Demo",
      email: "demo@finance.local",
      passwordHash: hash
    }
  });

  // conta padrão
  const account = await prisma.account.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user.id,
      name: "Carteira",
      type: "CASH",
      balance: 0,
    },
  });

  // categorias padrão
  const incomeCat = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user.id,
      name: "Salário",
      type: "INCOME",
    },
  });

  const expenseCat = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: {
      userId: user.id,
      name: "Alimentação",
      type: "EXPENSE",
    },
  });

  // exemplo de transação
  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: account.id,
      categoryId: incomeCat.id,
      date: new Date(),
      description: "Exemplo de crédito",
      amount: 1000.00,
      type: "INCOME",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed concluído.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
