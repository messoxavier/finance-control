import { Request, Response } from "express";
import { healthService } from "../services/health.service";

export const healthController = {
  async status(_req: Request, res: Response) {
    const payload = await healthService.check();
    return res.json(payload);
  }
};
