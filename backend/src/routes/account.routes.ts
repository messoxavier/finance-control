import { Router } from "express";
import { accountController } from "../controllers/account.controller";

const r = Router();

r.get("/", accountController.list);
r.post("/", accountController.create);
r.put("/:id", accountController.update);    
r.delete("/:id", accountController.archive);  

export default r;
