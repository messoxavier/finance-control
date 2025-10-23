import { Router } from "express";
import { categoryController } from "../controllers/category.controller";

const r = Router();

r.get("/", categoryController.list);
r.post("/", categoryController.create);

export default r;
