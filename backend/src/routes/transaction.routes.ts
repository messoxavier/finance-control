import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller";

const r = Router();

r.get("/", transactionController.list);
r.post("/", transactionController.create);

export default r;
