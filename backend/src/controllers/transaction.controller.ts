import { Request, Response } from "express";
import { CreateTransactionSchema, ListTransactionSchema } from "../schemas/transaction.schema";
import { transactionService } from "../services/transaction.service";

export const transactionController = {
  async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const parsed = ListTransactionSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const data = await transactionService.list(userId, parsed.data);
    return res.json(data);
  },

  async create(req: Request, res: Response) {
    const userId = req.user!.id;
    const parsed = CreateTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const created = await transactionService.create(userId, parsed.data);
    return res.status(201).json(created);
  }
};
