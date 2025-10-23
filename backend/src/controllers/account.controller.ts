import { Request, Response } from "express";
import { accountService } from "../services/account.service";
import { CreateAccountSchema } from "../schemas/account.schema";

export const accountController = {
  async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await accountService.list(userId);
    return res.json(data);
  },

  async create(req: Request, res: Response) {
    const parsed = CreateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const userId = req.user!.id;
    const created = await accountService.create(userId, parsed.data);
    return res.status(201).json(created);
  }
};
