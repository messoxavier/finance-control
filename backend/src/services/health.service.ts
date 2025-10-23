import { healthRepository } from "../repositories/health.repository";

export const healthService = {
  async check() {
    const now = await healthRepository.now();
    return {
      ok: true,
      message: "Backend ok",
      now
    };
  }
};
