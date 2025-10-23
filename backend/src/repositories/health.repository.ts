import { prisma } from "../config/prisma";

export const healthRepository = {
  async now() {
    try {
      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
};
