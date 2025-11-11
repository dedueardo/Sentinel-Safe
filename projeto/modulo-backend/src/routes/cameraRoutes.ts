import { Router } from "express";
import { CameraController } from "../controllers/cameraController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new CameraController();

router.use(authMiddleware);

router.post("/", (req, res) => controller.create(req, res));
router.get("/", (req, res) => controller.list(req, res));
router.get("/:id", (req, res) => controller.findById(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

export default router;
