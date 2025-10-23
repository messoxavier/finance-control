import { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import { CreateCategorySchema } from "../schemas/category.schema";

export const categoryController = {
  async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = await categoryService.list(userId);
    return res.json(data);
  },

  async create(req: Request, res: Response) {
    const parsed = CreateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const userId = req.user!.id;
    const created = await categoryService.create(userId, parsed.data);
    return res.status(201).json(created);
  }
};
