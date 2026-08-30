import { Router } from "express";
import { createUser, listUsers, login } from "../controllers/auth.controller.js";

const router = Router();

router.get("/users", listUsers);
router.post("/users", createUser);
router.post("/login", login);

export default router;
