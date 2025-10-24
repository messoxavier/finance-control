import { accountRepository } from "../repositories/account.repository";
import { CreateAccountInput } from "../schemas/account.schema";

export const accountService = {
  async list(userId: number) {
    return accountRepository.listByUser(userId);
  },

  async create(userId: number, payload: CreateAccountInput) {
    const exists = (await this.list(userId)).some(
      a => a.name.trim().toLowerCase() === payload.name.trim().toLowerCase()
    );
    if (exists) throw Object.assign(new Error("Já existe uma conta com esse nome."), { status: 409 });

    return accountRepository.create({
      userId,
      name: payload.name,
      type: payload.type,
      balance: payload.balance ?? 0
    });
  },

  async update(userId: number, id: number, data: Partial<CreateAccountInput>) {
    const acc = await accountRepository.findById(id, userId);
    if (!acc || acc.userId !== userId) throw Object.assign(new Error("Conta não encontrada"), { status: 404 });

    if (data.name && data.name.trim() !== acc.name) {
      const exists = (await this.list(userId)).some(a =>
        a.id !== id && a.name.trim().toLowerCase() === data.name!.trim().toLowerCase()
      );
      if (exists) throw Object.assign(new Error("Já existe uma conta com esse nome."), { status: 409 });
    }

    return accountRepository.update(id, userId, {
      name: data.name ?? acc.name,
      type: data.type ?? acc.type
    });
  },

  async archive(userId: number, id: number) {
    const acc = await accountRepository.findById(id, userId);
    if (!acc || acc.userId !== userId) throw Object.assign(new Error("Conta não encontrada"), { status: 404 });
    return accountRepository.archive(id);
  }
};
