import { Router } from "express";
import { createProjectController } from "../controllers/project.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../generated/prisma/enums.js";
import { getProjectsController } from "../controllers/project.controller.js";
import { updateProjectController } from "../controllers/project.controller.js";

const router = Router();
router.post(
    "/",
    authenticate,
    authorize(UserRole.PROJECT_MANAGER),
    createProjectController
);
router.get(
    "/",
    authenticate,
    getProjectsController
);
router.put(
  "/:projectId",
  authenticate,
  authorize(UserRole.PROJECT_MANAGER),
  updateProjectController
);
export default router;