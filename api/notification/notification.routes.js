import { Router } from "express";
import { registerPushToken } from "./notification.controller.js";

const router = Router();

router.post("/register-token", registerPushToken);

export default router;
