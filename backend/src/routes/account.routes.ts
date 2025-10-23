import { Router } from "express";
import { accountController } from "../controllers/account.controller";

const r = Router();

r.get("/", accountController.list);
r.post("/", accountController.create);

export default r;
