import { Router } from "express";
import { getNotificationsController } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
router.get("/", authenticate, getNotificationsController);
export default router;