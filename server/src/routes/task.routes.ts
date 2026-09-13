import { Router } from "express";
import { createTaskController } from "../controllers/task.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../generated/prisma/enums.js";
import {updateTaskStatusController} from "../controllers/task.controller.js";
import { getTasksController } from "../controllers/task.controller.js";

const router = Router();
router.post(
  "/",
  authenticate,
  authorize(UserRole.PROJECT_MANAGER),
  createTaskController
);
router.patch(
  "/:taskId/status",
  authenticate,
  updateTaskStatusController
);
router.get(
  "/",
  authenticate,
  getTasksController
);
export default router;