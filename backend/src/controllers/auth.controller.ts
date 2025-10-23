import { Request, Response } from "express";
import { RegisterSchema, LoginSchema } from "../schemas/auth.schema";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const result = await authService.register(parsed.data);
    return res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const result = await authService.login(parsed.data);
    return res.json(result);
  }
};
