import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();
const controller = new AuthController();

// POST /auth/login
router.post("/login", (req, res) => controller.login(req, res));

export default router;
