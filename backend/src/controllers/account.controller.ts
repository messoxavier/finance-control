import { Request, Response } from "express";
import { accountService } from "../services/account.service";
import { CreateAccountSchema } from "../schemas/account.schema";

export const accountController = {
  async list(req: Request, res: Response) {
    const data = await accountService.list(req.user!.id);
    return res.json(data);
  },

  async create(req: Request, res: Response) {
    const parsed = CreateAccountSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const created = await accountService.create(req.user!.id, parsed.data);
    return res.status(201).json(created);
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { name, type } = req.body ?? {};
    const updated = await accountService.update(req.user!.id, id, { name, type });
    return res.json(updated);
  },

  async archive(req: Request, res: Response) {
    const id = Number(req.params.id);
    await accountService.archive(req.user!.id, id);
    return res.status(204).send();
  }
};
