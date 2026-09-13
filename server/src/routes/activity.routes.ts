import { Router } from "express";
import { getActivitiesController } from "../controllers/activity.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getActivitiesController
);

export default router;