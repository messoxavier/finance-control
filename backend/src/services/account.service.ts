import { accountRepository } from "../repositories/account.repository";
import { CreateAccountInput } from "../schemas/account.schema";

export const accountService = {
  async list(userId: number) {
    return accountRepository.listByUser(userId);
  },

  async create(userId: number, payload: CreateAccountInput) {
    // regra simples: nome único por usuário? (opcional)
    const exists = (await this.list(userId)).some(a =>
      a.name.trim().toLowerCase() === payload.name.trim().toLowerCase()
    );
    if (exists) {
      throw Object.assign(new Error("Já existe uma conta com esse nome."), { status: 409 });
    }

    const account = await accountRepository.create({
      userId,
      name: payload.name,
      type: payload.type,
      balance: payload.balance ?? 0
    });

    return account;
  }
};
