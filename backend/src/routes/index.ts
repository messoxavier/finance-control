import { Router } from "express";
import { healthController } from "../controllers/health.controller";
import authRoutes from "./auth.routes";
import accountRoutes from "./account.routes";
import categoryRoutes from "./category.routes";
import transactionRoutes from "./transaction.routes";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/health", healthController.status);
router.use("/auth", authRoutes);

router.use(authMiddleware);
router.use("/accounts", accountRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);

export default router;
