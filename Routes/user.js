import express from "express";

import { authMiddleware } from "../Middleware/auth.js";
import userController from "../Controllers/user.js";

const router = new express.Router();

router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.put("/:email", userController.update);
router.get("/auth", authMiddleware, userController.check);
router.get("/:email", authMiddleware, userController.getByEmail);
export default router;
