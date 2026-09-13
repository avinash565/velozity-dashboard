import { Router } from "express";
import { registerController,loginController,refreshController } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../generated/prisma/enums.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshController)
router.get("/me" , authenticate, (req, res) => {
res.json({
    user: req.user
});
})

export default router;